import React from 'react';
import { Box, Flex, HStack, Text } from '@chakra-ui/react';

/** Plain-CSS grouped bars: registered (paid) vs attended for every edition. */
export default function CompareBars({ rows }) {
  const max = Math.max(1, ...rows.map(r => r.paid));
  return (
    <Box>
      <HStack spacing={5} mb={4} fontSize="sm">
        <HStack><Box boxSize="10px" borderRadius="sm" bg="brand.500" /><Text>Registered (paid)</Text></HStack>
        <HStack><Box boxSize="10px" borderRadius="sm" bg="saffron.400" /><Text>Attended</Text></HStack>
      </HStack>
      <Flex align="flex-end" gap={{ base: 4, md: 8 }} minH="220px" overflowX="auto" pb={1}>
        {rows.map(r => (
          <Box key={r.id} flex="1" minW="86px" textAlign="center">
            <Flex align="flex-end" justify="center" gap={2} h="180px">
              {[['paid', 'brand.500'], ['attended', 'saffron.400']].map(([key, color]) => (
                <Flex key={key} direction="column" justify="flex-end" align="center" h="100%" w="34px">
                  <Text fontSize="xs" fontWeight="bold" mb={1}>{r[key]}</Text>
                  <Box
                    w="100%"
                    bg={color}
                    borderTopRadius="md"
                    h={`${Math.max(3, (r[key] / max) * 100)}%`}
                    transition="height .6s ease"
                  />
                </Flex>
              ))}
            </Flex>
            <Text mt={2} fontSize="sm" fontWeight="bold" noOfLines={2}>{r.name}</Text>
            <Text fontSize="xs" color="text.muted">{r.attendanceRate}% came</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
