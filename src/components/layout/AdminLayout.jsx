import React, { Suspense } from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import PageSpinner from '../common/PageSpinner';
import { AdminEventProvider } from '../../context/AdminEventContext';

/** Persistent shell for every admin route; only the page inside <Outlet/> remounts. */
export default function AdminLayout() {
  return (
    <Box minH="100vh" bg="bg.page">
      <Sidebar />
      <AdminEventProvider>
        <Box
          as="main"
          ml={{ base: 0, md: SIDEBAR_WIDTH }}
          mt={{ base: '56px', md: 0 }}
          p={{ base: 3, md: 6 }}
        >
          <Suspense fallback={<PageSpinner minH="60vh" />}>
            <Outlet />
          </Suspense>
        </Box>
      </AdminEventProvider>
    </Box>
  );
}
