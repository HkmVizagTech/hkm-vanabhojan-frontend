import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Inbox } from 'lucide-react';

/** Friendly "nothing here yet" block with an optional next step. */
export default function EmptyState({ icon: IconCmp = Inbox, title, text, action }) {
  return (
    <Flex direction="column" align="center" textAlign="center" py={{ base: 10, md: 14 }} px={4} gap={2}>
      <Flex boxSize="56px" align="center" justify="center" borderRadius="2xl" bg="brand.50" color="brand.600" _dark={{ bg: 'whiteAlpha.100', color: 'brand.200' }}>
        <IconCmp size={26} />
      </Flex>
      <Text fontWeight="bold" fontSize="lg" mt={1}>{title}</Text>
      {text && <Text color="text.muted" maxW="md" fontSize="sm">{text}</Text>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </Flex>
  );
}
