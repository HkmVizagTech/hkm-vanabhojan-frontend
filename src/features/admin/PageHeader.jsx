import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
      <div>
        <Heading as="h1" size="xl" color="text.heading" lineHeight="1.1">{title}</Heading>
        {subtitle && <Text color="text.muted" fontSize="sm" mt={1}>{subtitle}</Text>}
      </div>
      {/* On a phone the buttons sit two to a row (the event switcher takes a full row) instead of one per row. */}
      <Flex
        gap={2}
        wrap="wrap"
        w={{ base: 'full', md: 'auto' }}
        sx={{
          '& > *': { flex: { base: '1 1 calc(50% - 4px)', md: '0 0 auto' }, minW: 0 },
          '& > :first-child': { flex: { base: '1 1 100%', md: '0 0 auto' } },
          '& > button': { fontSize: { base: 'sm', md: 'md' }, px: { base: 3, md: 6 } },
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
}
