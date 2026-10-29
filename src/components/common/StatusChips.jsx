import React from 'react';
import { HStack, Text } from '@chakra-ui/react';

/**
 * Clickable filter pills with live counts, e.g. All 120 | Paid 98 | Pending 12.
 * options: [{ value, label, count, color }]
 */
export default function StatusChips({ options, value, onChange }) {
  return (
    <HStack spacing={2} flexWrap="wrap" role="group" aria-label="Filter by status">
      {options.map(o => {
        const active = o.value === value;
        const color = o.color || 'gray';
        return (
          <HStack
            key={o.value || 'all'}
            as="button"
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            spacing={2}
            px={3}
            h="34px"
            borderRadius="full"
            borderWidth="1px"
            fontSize="sm"
            fontWeight="bold"
            transition="all .15s"
            bg={active ? `${color}.500` : 'bg.card'}
            color={active ? 'white' : 'inherit'}
            borderColor={active ? `${color}.500` : 'border.soft'}
            _hover={{ borderColor: `${color}.400` }}
          >
            <Text as="span">{o.label}</Text>
            <Text
              as="span"
              px={2}
              borderRadius="full"
              fontSize="xs"
              bg={active ? 'whiteAlpha.300' : 'bg.subtle'}
            >
              {o.count}
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
}
