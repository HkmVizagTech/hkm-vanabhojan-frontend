import React from 'react';
import { Outlet } from 'react-router-dom';
import { Center, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

/** Admins, and volunteers an admin gave the cash permission to. */
export default function RequireCashAccess() {
  const { role, canCollectCash } = useAuth();
  if (role === 'admin' || canCollectCash) return <Outlet />;
  return (
    <Center minH="60vh">
      <VStack spacing={2}>
        <Heading size="lg" color="red.500">No cash desk access</Heading>
        <Text color="text.muted">Ask an admin to give your account the cash permission.</Text>
      </VStack>
    </Center>
  );
}
