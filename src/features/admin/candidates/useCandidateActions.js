import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { candidatesApi } from '../../../services/candidates';
import { getErrorMessage } from '../../../services/http';
import { ACTION_COPY } from './constants';

/** Accept / reject / refund flow: ask for confirmation, call the API, patch the cached row. */
export function useCandidateActions({ onUpdated }) {
  const toast = useToast();
  const [pending, setPending] = useState(null); // { action, candidateId }
  const [busyId, setBusyId] = useState(null);

  const request = useCallback((action, candidateId) => setPending({ action, candidateId }), []);
  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(async () => {
    if (!pending) return;
    const { action, candidateId } = pending;
    setBusyId(candidateId);
    try {
      const result = await candidatesApi.act(action, candidateId);
      onUpdated(candidateId, result.data);
      toast({ title: ACTION_COPY[action].done, status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({
        title: `Failed to ${action} candidate`,
        description: getErrorMessage(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
      setPending(null);
    }
  }, [pending, onUpdated, toast]);

  return { pending, busyId, request, cancel, confirm };
}
