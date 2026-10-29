import React, { memo } from 'react';
import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';

const Row = memo(function Row({ row, index, columns, onRowClick, rowProps }) {
  return (
    <Tr
      _hover={{ bg: 'bg.subtle', cursor: onRowClick ? 'pointer' : undefined }}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      {...rowProps?.(row)}
    >
      {columns.map(col => (
        <Td key={col.key} minW={col.minW} whiteSpace={col.wrap ? 'normal' : 'nowrap'}>
          {col.render(row, index)}
        </Td>
      ))}
    </Tr>
  );
});

/**
 * Column-driven table.
 * columns: [{ key, header, render(row, index), minW?, wrap? }]. Rows are memoised, so keep
 * `columns`, `onRowClick` and `rowProps` referentially stable (module constants or useCallback).
 */
export default function DataTable({ columns, rows, rowKey = '_id', offset = 0, onRowClick, rowProps, emptyText }) {
  return (
    <Box overflowX="auto" borderRadius="xl" borderWidth="1px" borderColor="border.soft" bg="bg.card">
      <Table size="sm" variant="simple">
        <Thead position="sticky" top={0} zIndex={1} bg="bg.subtle">
          <Tr>
            {columns.map(col => (
              <Th key={col.key} whiteSpace="nowrap">{col.header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, i) => (
            <Row
              key={row[rowKey]}
              row={row}
              index={offset + i}
              columns={columns}
              onRowClick={onRowClick}
              rowProps={rowProps}
            />
          ))}
          {rows.length === 0 && (
            <Tr>
              <Td colSpan={columns.length}>
                <Text color="text.muted" textAlign="center" py={10}>{emptyText}</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
