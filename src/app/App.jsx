import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../context/AuthContext';
import { CurrentEventProvider } from '../context/CurrentEventContext';
import { theme } from '../theme';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <CurrentEventProvider>
          <AppRoutes />
        </CurrentEventProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
