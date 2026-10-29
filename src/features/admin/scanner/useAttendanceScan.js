import { useCallback, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { attendanceApi } from '../../../services/attendance';
import { getErrorMessage } from '../../../services/http';
import { signal } from './feedback';

const COOLDOWN_MS = 3000; // the camera re-decodes a held-up code every frame
const HISTORY_LIMIT = 10;

const toResult = (token, response) => {
  const members = response.familyMembers?.length ? response.familyMembers : response.data ? [response.data] : [];
  return {
    token,
    status: response.status,
    message: response.message,
    members,
    total: response.totalMembers || members.length,
    scannedBy: response.scannedPerson || (members.length === 1 ? members[0].name : ''),
    at: new Date(),
  };
};

/** Sends each scanned QR token to the backend once, and keeps the latest result + a short history. */
export function useAttendanceScan() {
  const toast = useToast();
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const lastRef = useRef({ value: '', time: 0 });
  const busyRef = useRef(false);

  const record = useCallback(next => {
    setResult(next);
    setHistory(prev => [next, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  const handleDecode = useCallback(
    async token => {
      const now = Date.now();
      if (busyRef.current) return;
      if (token === lastRef.current.value && now - lastRef.current.time < COOLDOWN_MS) return;
      lastRef.current = { value: token, time: now };
      busyRef.current = true;
      setResult(null);
      toast({ title: 'QR Code Scanned', status: 'success', duration: 1500, isClosable: true, position: 'top' });
      try {
        const next = toResult(token, await attendanceApi.scan(token));
        signal(next.status === 'already-marked' ? 'warning' : 'success');
        record(next);
      } catch (err) {
        // 401/403 are handled globally (logout + redirect), everything else is shown inline.
        signal('error');
        record({
          token,
          status: 'error',
          message: err.response?.data?.message || getErrorMessage(err, 'Error fetching candidate details'),
          members: [],
          total: 0,
          scannedBy: '',
          at: new Date(),
        });
      } finally {
        busyRef.current = false;
        lastRef.current.time = Date.now();
      }
    },
    [record, toast]
  );

  return { result, history, handleDecode };
}
