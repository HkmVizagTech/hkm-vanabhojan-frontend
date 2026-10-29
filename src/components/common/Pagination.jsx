import React from 'react';
import { HStack, IconButton, Text } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageCount, onChange, total, offset, pageSize }) {
  if (total === 0) return null;
  const from = offset + 1;
  const to = Math.min(offset + pageSize, total);
  return (
    <HStack justify="space-between" mt={3} px={1} flexWrap="wrap" spacing={3}>
      <Text fontSize="sm" color="text.muted">
        Showing {from}–{to} of {total}
      </Text>
      <HStack>
        <IconButton
          size="sm"
          variant="outline"
          aria-label="Previous page"
          icon={<ChevronLeft size={16} />}
          onClick={() => onChange(page - 1)}
          isDisabled={page <= 1}
        />
        <Text fontSize="sm" minW="72px" textAlign="center">
          {page} / {pageCount}
        </Text>
        <IconButton
          size="sm"
          variant="outline"
          aria-label="Next page"
          icon={<ChevronRight size={16} />}
          onClick={() => onChange(page + 1)}
          isDisabled={page >= pageCount}
        />
      </HStack>
    </HStack>
  );
}
