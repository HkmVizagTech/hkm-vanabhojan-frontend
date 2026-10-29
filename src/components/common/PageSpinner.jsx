import React from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function PageSpinner({ label, minH = '100vh' }) {
  return (
    <Center minH={minH} role="status">
      <VStack spacing={3}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        {label && <Text color="text.muted">{label}</Text>}
      </VStack>
    </Center>
  );
}
