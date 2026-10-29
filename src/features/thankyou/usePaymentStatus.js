import { useEffect, useState } from 'react';
import { registrationApi } from '../../services/registration';

const MAX_ATTEMPTS = 12;
const POLL_MS = 3000;
// Poll attempts (0-based) at which a still-pending payment is nudged through the immediate verifier.
const NUDGE_ATTEMPTS = [2, 5];

const toStatus = candidate => {
  if (candidate.paymentStatus === 'Paid') return 'success';
  if (candidate.paymentStatus === 'Failed') return 'failed';
  return 'pending';
};

/**
 * Polls the backend until the payment settles.
 * status: loading | success | failed | pending | invalid | error
 */
export function usePaymentStatus(paymentId) {
  const [state, setState] = useState({ status: 'loading', candidate: null });

  useEffect(() => {
    if (!paymentId) return undefined;
    let cancelled = false;
    let timer;
    let attempt = 0;
    let candidate = null;

    const fetchStatus = async () => {
      try {
        const res = await registrationApi.getPaymentStatus(paymentId);
        if (res.data?.success && res.data.candidate) {
          candidate = res.data.candidate;
          return toStatus(candidate);
        }
        return 'invalid';
      } catch (err) {
        console.error('Payment verification error:', err);
        return 'error';
      }
    };

    const publish = status => {
      if (!cancelled) setState({ status, candidate });
    };

    const tick = async () => {
      let status = await fetchStatus();
      if (cancelled) return;

      if (status === 'pending' && NUDGE_ATTEMPTS.includes(attempt) && candidate?.orderId) {
        try {
          const nudge = await registrationApi.verifyImmediately({
            orderId: candidate.orderId,
            paymentId: candidate.paymentId,
          });
          if (nudge?.success) status = await fetchStatus();
        } catch (err) {
          console.error('Immediate verification failed:', err);
        }
        if (cancelled) return;
      }

      publish(status);
      attempt += 1;
      if (status === 'success' || status === 'failed' || attempt >= MAX_ATTEMPTS) return;
      timer = setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId]);

  return state;
}
