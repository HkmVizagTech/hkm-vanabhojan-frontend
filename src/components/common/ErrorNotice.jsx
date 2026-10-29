import React from 'react';
import { Alert, AlertDescription, AlertIcon, Button } from '@chakra-ui/react';
import { getErrorMessage } from '../../services/http';

export default function ErrorNotice({ error, onRetry, fallback = 'Could not load data.' }) {
  if (!error) return null;
  return (
    <Alert status="error" borderRadius="lg" mb={4}>
      <AlertIcon />
      <AlertDescription flex="1">{getErrorMessage(error, fallback)}</AlertDescription>
      {onRetry && (
        <Button size="sm" onClick={onRetry} variant="outline" colorScheme="red">
          Retry
        </Button>
      )}
    </Alert>
  );
}
