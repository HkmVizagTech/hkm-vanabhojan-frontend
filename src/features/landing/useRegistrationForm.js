import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { FIELD_ORDER, initialValues, validateRegistration } from './validation';
import { onlyDigits } from '../../utils/format';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** All form state, validation and student-ID upload handling for the registration page. */
export function useRegistrationForm() {
  const toast = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [idCard, setIdCard] = useState({ file: null, previewUrl: '' });
  const previewRef = useRef('');

  // Release the blob URL when it is replaced or the page unmounts.
  useEffect(() => {
    previewRef.current = idCard.previewUrl;
  }, [idCard.previewUrl]);
  useEffect(() => () => previewRef.current && URL.revokeObjectURL(previewRef.current), []);

  const setField = useCallback((name, rawValue) => {
    const value = name === 'whatsappNumber' ? onlyDigits(rawValue).slice(0, 10) : rawValue;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  const clearIdCard = useCallback(() => {
    setIdCard(prev => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file: null, previewUrl: '' };
    });
  }, []);

  const pickIdCard = useCallback(
    file => {
      if (!file) return;
      const fail = (title, description) =>
        toast({ title, description, status: 'error', duration: 3000, isClosable: true });
      if (!ALLOWED_TYPES.includes(file.type)) return fail('Invalid file type', 'Please upload a JPG, PNG, or WebP image file');
      if (file.size > MAX_FILE_BYTES) return fail('File too large', 'Please upload an image smaller than 5MB');
      setIdCard(prev => {
        if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { file, previewUrl: URL.createObjectURL(file) };
      });
    },
    [toast]
  );

  /** Validates, shows errors and focuses the first invalid field. Returns true when valid. */
  const validate = useCallback(() => {
    const found = validateRegistration(values);
    setErrors(found);
    const first = FIELD_ORDER.find(f => found[f]);
    if (first) {
      const field = document.querySelector(`[data-field="${first}"]`);
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field?.querySelector('input, select, textarea')?.focus({ preventScroll: true });
    }
    return !first;
  }, [values]);

  return { values, errors, setField, idCard, pickIdCard, clearIdCard, validate };
}
