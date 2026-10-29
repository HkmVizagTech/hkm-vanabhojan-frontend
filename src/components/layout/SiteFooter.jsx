import React from 'react';
import { Box, Link, Stack, Text } from '@chakra-ui/react';
import { EVENT, MAHAMANTRA } from '../../config/event';
import Reveal from '../common/Reveal';

export default function SiteFooter() {
  return (
    <Box as="footer" mt={20} pt={14} pb={{ base: 28, md: 14 }} px={4} textAlign="center" bgGradient="linear(to-b, transparent, brand.700)" color="white">
      <Reveal maxW="2xl" mx="auto">
        <Text fontFamily="deva" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.8" color="saffron.200">
          {MAHAMANTRA.devanagari}
        </Text>
        <Text mt={2} fontFamily="heading" fontSize={{ base: 'md', md: 'lg' }} fontStyle="italic" opacity={0.9}>
          {MAHAMANTRA.roman}
        </Text>
        <Stack mt={8} spacing={1} fontSize="sm" opacity={0.9}>
          <Text>
            For any queries, contact us at{' '}
            <Link href={`mailto:${EVENT.contact.email}`} textDecoration="underline">
              {EVENT.contact.email}
            </Link>
          </Text>
          <Text>
            © {new Date().getFullYear()} {EVENT.organiser}
          </Text>
        </Stack>
      </Reveal>
    </Box>
  );
}
