import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { candidatesApi } from '../../../services/candidates';
import { getErrorMessage } from '../../../services/http';
import { ACTION_COPY } from './constants';

// What the row will look like once the server agrees. Applied at once so the admin never waits for WhatsApp / Razorpay.
const expectedPatch = action => {
  const now = new Date().toISOString();
  if (action === 'accept') return { adminAction: 'Accepted', adminActionDate: now };
  if (action === 'reject') return { adminAction: 'Rejected', adminActionDate: now };
  return { adminAction: 'Refunded', adminActionDate: now, paymentStatus: 'Refunded' };
};

/**
 * Accept / reject / refund flow: ask for confirmation, show the result straight away (optimistic), call the API in the
 * background, then replace the guess with the server's row, or put the old values back if the call failed.
 */
export function useCandidateActions({ onUpdated, getCandidate }) {
  const toast = useToast();
  const [pending, setPending] = useState(null); // { action, candidateId }
  const [busyId, setBusyId] = useState(null);

  const request = useCallback((action, candidateId) => setPending({ action, candidateId }), []);
  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(async () => {
    if (!pending) return;
    const { action, candidateId } = pending;
    setBusyId(candidateId);
    const guess = expectedPatch(action);
    const before = getCandidate?.(candidateId);
    const undo = before ? Object.fromEntries(Object.keys(guess).map(key => [key, before[key]])) : null;
    if (undo) onUpdated(candidateId, guess);
    setPending(null); // close the confirmation now; the popup already shows the new state
    try {
      const result = await candidatesApi.act(action, candidateId);
      onUpdated(candidateId, result.data);
      // The server explains a partial outcome (for example a rejection whose refund failed): show that instead of plain success.
      const partial = result.refund === 'failed';
      toast({
        title: partial ? 'Rejected, but the refund failed' : ACTION_COPY[action].done,
        description: partial ? result.message : undefined,
        status: partial ? 'warning' : 'success',
        duration: partial ? 8000 : 3000,
        isClosable: true,
      });
    } catch (error) {
      if (undo) onUpdated(candidateId, undo);
      toast({
        title: `Failed to ${action} candidate`,
        description: getErrorMessage(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  }, [pending, onUpdated, getCandidate, toast]);

  return { pending, busyId, request, cancel, confirm };
}
