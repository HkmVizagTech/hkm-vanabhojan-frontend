import { useCallback, useState } from 'react';
import { attendanceApi } from '../../services/attendance';
import { getErrorMessage } from '../../services/http';
import { onlyDigits } from '../../utils/format';

const NOT_FOUND_HINTS = ['not found', 'not registered', 'no user'];

const initial = { loading: false, fieldError: '', notFound: false, error: '', candidates: [], total: 0 };

/** Looks up every registration (and its attendance QR) tied to a WhatsApp number. */
export function useQrLookup() {
  const [state, setState] = useState(initial);

  const lookup = useCallback(async rawPhone => {
    const phone = onlyDigits(rawPhone.trim());
    if (!/^\d{10}$/.test(phone)) {
      setState({ ...initial, fieldError: 'Please enter a valid 10-digit phone number.' });
      return false;
    }
    setState({ ...initial, loading: true });
    try {
      const data = await attendanceApi.getQrCodes(phone);
      if (data.candidates?.length) {
        setState({ ...initial, candidates: data.candidates, total: data.totalCandidates || data.candidates.length });
        return true;
      }
      setState({ ...initial, error: 'No QR codes found for this number' });
    } catch (err) {
      const message = (err.response?.data?.message || '').toLowerCase();
      if (NOT_FOUND_HINTS.some(hint => message.includes(hint))) {
        setState({ ...initial, notFound: true });
      } else {
        setState({ ...initial, error: getErrorMessage(err, 'Could not fetch QR codes') });
      }
    }
    return false;
  }, []);

  return { ...state, lookup };
}
