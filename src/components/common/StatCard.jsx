import React from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import CountUp from './CountUp';

/** One headline number with an icon tile. `hint` is small supporting text under it. Pass `onClick` to make the card a button (`active` marks it selected). */
export default function StatCard({ label, value, icon, color = 'brand', format, hint, onClick, active }) {
  const clickable = Boolean(onClick);
  return (
    <Flex
      as={clickable ? 'button' : undefined}
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      textAlign="left"
      cursor={clickable ? 'pointer' : 'default'}
      aria-pressed={clickable ? Boolean(active) : undefined}
      align="flex-start"
      gap={3.5}
      bg="bg.card"
      borderWidth="1px"
      borderColor={active ? `${color}.500` : 'border.soft'}
      borderRadius="2xl"
      p={4}
      boxShadow="0 1px 2px rgba(16,24,40,0.04)"
      // Shadow only: <Reveal> animates the card's position, and a CSS transition on it would fight that.
      transition="box-shadow .2s ease"
      _hover={{ boxShadow: 'lift' }}
      _focusVisible={{ boxShadow: 'outline' }}
    >
      {icon && (
        <Flex
          flexShrink={0}
          boxSize="44px"
          align="center"
          justify="center"
          borderRadius="xl"
          bg={`${color}.600`}
          color="white"
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
      )}
      <Box minW={0}>
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color="text.muted" fontWeight="bold" noOfLines={1}>
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="extrabold" lineHeight="1.15" mt={0.5}>
          <CountUp value={value} format={format} />
        </Text>
        {hint && (
          <Text fontSize="xs" color="text.muted" mt={0.5}>
            {hint}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
