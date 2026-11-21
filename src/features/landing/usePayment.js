import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { RAZORPAY_KEY } from '../../config/env';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import { getErrorMessage } from '../../services/http';
import { registrationApi } from '../../services/registration';
import { feeFor } from './validation';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/** A failed confirmation call is worth repeating when the network, the server or the rate limit is to blame, not when the signature is wrong. */
const isRetryable = err => !err?.response || err.response.status >= 500 || err.response.status === 429;

/**
 * Asks our server to confirm a payment the student has already made. Tries the normal confirmation a few times, then asks the
 * server to look the payment up at Razorpay. Resolves true when the server has it as paid.
 */
async function confirmPayment({ response, payload }) {
  const body = {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
    formData: { ...payload, paymentMethod: 'Online', receipt: `receipt_${Date.now()}` },
  };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await registrationApi.verifyPayment(body);
      if (result.message === 'success' || result.message === 'Already Registered') return true;
      throw new Error(result.message);
    } catch (err) {
      if (!isRetryable(err)) throw err;
      await wait(1000 * (attempt + 1));
    }
  }
  const lookup = await registrationApi
    .verifyImmediately({ orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id })
    .catch(() => null);
  return Boolean(lookup?.success);
}

/** Creates the order, opens Razorpay checkout, confirms the payment, then routes to the thank-you page. */
export function usePayment() {
  const toast = useToast();
  const navigate = useNavigate();
  const loadRazorpay = useRazorpay();
  const { event } = useCurrentEvent();
  const [isPaying, setIsPaying] = useState(false);
  const lastFailure = useRef(null); // the newest failure in the open checkout window, shown only if the student gives up

  const notifyError = useCallback(
    (title, description) =>
      toast({ title, description: description || 'Try again later', status: 'error', duration: 5000, isClosable: true }),
    [toast]
  );

  const pay = useCallback(
    async ({ payload, studentIdCard }) => {
      setIsPaying(true);
      try {
        const Razorpay = await loadRazorpay();
        const amountInPaise = feeFor(event, payload.collegeOrWorking) * 100;
        const order = await registrationApi.createOrder({ amountInPaise, formData: payload, studentIdCard });
        if (!order?.id) throw new Error('Order creation failed');

        lastFailure.current = null;
        const checkout = new Razorpay({
          key: order.keyId || RAZORPAY_KEY,
          amount: order.amount,
          currency: 'INR',
          name: event?.title || 'Kartika Vanabhojanam',
          description: 'Registration Fee',
          order_id: order.id,
          prefill: { name: payload.name, email: payload.email, contact: `91${payload.whatsappNumber}` },
          theme: { color: '#20603d' },
          // Wallets are hidden: nearly every wallet payment was declined. Closing the window asks first, because a student
          // may be in their UPI app approving the payment.
          config: { display: { hide: [{ method: 'wallet' }, { method: 'emi' }, { method: 'paylater' }] } },
          modal: {
            confirm_close: true,
            ondismiss: () => {
              // Razorpay lets the student retry inside the window, so a failure is only reported once they close it.
              if (lastFailure.current) {
                notifyError("Payment didn't go through", `${lastFailure.current} Nothing was taken, or any amount taken is returned by your bank. You can try again.`);
                lastFailure.current = null;
              }
              setIsPaying(false);
            },
          },
          handler: async response => {
            lastFailure.current = null;
            try {
              if (!(await confirmPayment({ response, payload }))) {
                // The money has been taken: never tell the student it failed, or they will pay a second time.
                toast({
                  title: 'Payment received. Please do not pay again.',
                  description: `We are confirming it and will send your confirmation on WhatsApp shortly. Reference: ${response.razorpay_payment_id}`,
                  status: 'warning',
                  duration: 20000,
                  isClosable: true,
                });
                return;
              }
              toast({
                title: 'Registration Successful!',
                description: 'Your registration is confirmed.',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
              navigate(`/thankyou/${response.razorpay_payment_id}`);
            } catch (err) {
              notifyError('We could not confirm your payment yet', `${getErrorMessage(err)} If money was deducted, please do not pay again: write to us with reference ${response.razorpay_payment_id}.`);
            } finally {
              setIsPaying(false);
            }
          },
        });
        // Keep the window's own retry in charge: remember why this try failed, say nothing yet, leave the button locked.
        checkout.on('payment.failed', response => {
          lastFailure.current = response?.error?.description || 'The payment could not be completed.';
        });
        checkout.open();
      } catch (err) {
        // 409 means this person has already paid: say so, instead of a generic "Payment failed".
        const already = err?.response?.status === 409 && /already registered/i.test(getErrorMessage(err));
        // Anything that fails before the checkout window opens has not charged the student, so do not call it a payment failure.
        notifyError(already ? 'Already registered' : 'Could not start the payment', already ? getErrorMessage(err) : `${getErrorMessage(err)} Nothing was charged.`);
        setIsPaying(false);
      }
    },
    [event, loadRazorpay, navigate, notifyError, toast]
  );

  return { pay, isPaying };
}
