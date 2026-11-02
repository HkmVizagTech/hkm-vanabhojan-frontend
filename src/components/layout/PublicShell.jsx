import React from 'react';
import { Box } from '@chakra-ui/react';

/** Shared backdrop for public pages: plain ivory with one very faint warm light at the top. */
export default function PublicShell({ children, ...boxProps }) {
  return (
    <Box minH="100vh" position="relative" overflowX="clip" bg="bg.page" {...boxProps}>
      <Box
        aria-hidden="true"
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="720px"
        pointerEvents="none"
        bgImage="radial-gradient(ellipse 70% 60% at 78% 20%, rgba(201,162,74,0.12), transparent 70%)"
        _dark={{ bgImage: 'none' }}
      />
      <Box position="relative">{children}</Box>
    </Box>
  );
}
