import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, subtitle, light = false, align = 'center' }) {
  return (
    <Reveal mb={{ base: 8, md: 12 }} textAlign={align}>
      {eyebrow && (
        <Text
          fontSize="xs"
          fontWeight="extrabold"
          letterSpacing="0.22em"
          textTransform="uppercase"
          color={light ? 'saffron.300' : 'lotus.500'}
          mb={2}
        >
          {eyebrow}
        </Text>
      )}
      <Heading as="h2" fontSize={{ base: '3xl', md: '5xl' }} color={light ? 'white' : 'text.heading'} lineHeight="1.05">
        {title}
      </Heading>
      {subtitle && (
        <Text mt={3} maxW="2xl" mx={align === 'center' ? 'auto' : undefined} color={light ? 'whiteAlpha.800' : 'text.muted'}>
          {subtitle}
        </Text>
      )}
      <Box mt={4} h="3px" w="64px" mx={align === 'center' ? 'auto' : undefined} borderRadius="full" bgGradient="linear(to-r, saffron.400, lotus.400)" />
    </Reveal>
  );
}
