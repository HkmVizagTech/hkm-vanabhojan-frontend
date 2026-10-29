import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Center, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import PageSpinner from './PageSpinner';

/** Route guard. Renders nested routes once the session is verified and the role is allowed. */
export default function RequireAuth({ allowedRoles }) {
  const { status, role, verify } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (status === 'unverified') verify();
  }, [status, verify]);

  if (status === 'unverified' || status === 'checking') {
    return <PageSpinner label="Verifying authentication..." />;
  }
  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (!allowedRoles.includes(role)) {
    return (
      <Center minH="60vh">
        <VStack spacing={2}>
          <Heading size="lg" color="red.500">Access Denied</Heading>
          <Text color="text.muted">You don't have permission to access this page.</Text>
        </VStack>
      </Center>
    );
  }
  return <Outlet />;
}
