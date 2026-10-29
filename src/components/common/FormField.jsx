import React from 'react';
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';

/** Label + control + error wrapper. `id` is also the DOM id the control must use. */
export default function FormField({ id, label, required, error, hint, children, ...rest }) {
  return (
    <FormControl id={id} data-field={id} isInvalid={Boolean(error)} isRequired={required} {...rest}>
      <FormLabel>{label}</FormLabel>
      {children}
      {hint && !error && <FormHelperText>{hint}</FormHelperText>}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
