import React from 'react';
import { Box } from '@chakra-ui/react';
import natureBg from '../../assets/vanabhojanam-nature.jpg';

/** Shared backdrop for every public page: soft nature photo under a cream wash. */
export default function PublicShell({ children, ...boxProps }) {
  return (
    <Box
      minH="100vh"
      position="relative"
      overflowX="hidden"
      bgColor="bg.page"
      {...boxProps}
    >
      <Box
        aria-hidden="true"
        position="fixed"
        inset={0}
        zIndex={0}
        bgImage={`linear-gradient(180deg, rgba(246,243,232,0.95) 0%, rgba(233,248,239,0.93) 100%), url(${natureBg})`}
        bgSize="cover"
        bgPosition="center"
        _dark={{
          bgImage: `linear-gradient(180deg, rgba(14,26,19,0.94) 0%, rgba(14,26,19,0.9) 100%), url(${natureBg})`,
        }}
      />
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
}
