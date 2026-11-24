import React from 'react';
import { Outlet } from 'react-router-dom';
import { Center, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

/** Admins and volunteers, plus view-only accounts an admin gave the scanner to. */
export default function RequireScanAccess() {
  const { role, canScan } = useAuth();
  if (role === 'admin' || role === 'user' || canScan) return <Outlet />;
  return (
    <Center minH="60vh">
      <VStack spacing={2}>
        <Heading size="lg" color="red.500">No scanner access</Heading>
        <Text color="text.muted">Ask an admin to give your account the scanner permission.</Text>
      </VStack>
    </Center>
  );
}
