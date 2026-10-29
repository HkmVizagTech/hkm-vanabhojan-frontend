import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { RAZORPAY_KEY } from '../../config/env';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import { getErrorMessage } from '../../services/http';
import { registrationApi } from '../../services/registration';
import { feeFor } from './validation';

/** Creates the order, opens Razorpay checkout, verifies the payment, then routes to the thank-you page. */
export function usePayment() {
  const toast = useToast();
  const navigate = useNavigate();
  const loadRazorpay = useRazorpay();
  const { event } = useCurrentEvent();
  const [isPaying, setIsPaying] = useState(false);

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

        const checkout = new Razorpay({
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: 'INR',
          name: event?.title || 'Vanabhojanam Youth Festival',
          description: 'Registration Fee',
          order_id: order.id,
          prefill: { name: payload.name, email: payload.email, contact: `91${payload.whatsappNumber}` },
          theme: { color: '#20603d' },
          modal: { ondismiss: () => setIsPaying(false) },
          handler: async response => {
            try {
              const result = await registrationApi.verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                formData: { ...payload, paymentMethod: 'Online', receipt: `receipt_${Date.now()}` },
              });
              if (result.message !== 'success' && result.message !== 'Already Registered') {
                throw new Error(result.message);
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
              notifyError('Payment verification failed', getErrorMessage(err));
            } finally {
              setIsPaying(false);
            }
          },
        });
        checkout.on('payment.failed', response => {
          notifyError('Payment failed', response?.error?.description);
          setIsPaying(false);
        });
        checkout.open();
      } catch (err) {
        notifyError('Payment failed', getErrorMessage(err));
        setIsPaying(false);
      }
    },
    [event, loadRazorpay, navigate, notifyError, toast]
  );

  return { pay, isPaying };
}
