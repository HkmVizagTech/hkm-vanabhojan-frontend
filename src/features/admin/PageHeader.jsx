import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
      <div>
        <Heading size="lg" color="text.heading">{title}</Heading>
        {subtitle && <Text color="text.muted" fontSize="sm">{subtitle}</Text>}
      </div>
      <Flex gap={2} wrap="wrap">{children}</Flex>
    </Flex>
  );
}
