import React from 'react';
import { Box, HStack, Icon, Text } from '@chakra-ui/react';
import CountUp from './CountUp';

export default function StatCard({ label, value, icon, color = 'brand', format, hint }) {
  return (
    <Box
      bg="bg.card"
      borderWidth="1px"
      borderColor="border.soft"
      borderRadius="xl"
      p={4}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-30px"
        right="-30px"
        boxSize="110px"
        borderRadius="full"
        bg={`${color}.100`}
        opacity={0.55}
        _dark={{ bg: `${color}.800`, opacity: 0.4 }}
      />
      <HStack spacing={3} position="relative">
        {icon && (
          <Box p={2} borderRadius="lg" bg={`${color}.50`} color={`${color}.600`} _dark={{ bg: `${color}.900`, color: `${color}.200` }}>
            <Icon as={icon} boxSize={5} />
          </Box>
        )}
        <Box>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="text.muted" fontWeight="bold">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="extrabold" lineHeight="1.1">
            <CountUp value={value} format={format} />
          </Text>
          {hint && (
            <Text fontSize="xs" color="text.muted">
              {hint}
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
