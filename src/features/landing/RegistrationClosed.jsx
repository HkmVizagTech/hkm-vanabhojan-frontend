import React from 'react';
import { Box, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@chakra-ui/react';
import { EVENT } from '../../config/event';

/** Shown instead of the form when there is no edition, or its registration is closed. */
export default function RegistrationClosed({ event, loading }) {
  if (loading) {
    return (
      <VStack py={10}>
        <Spinner color="brand.500" />
      </VStack>
    );
  }
  return (
    <Box textAlign="center" p={{ base: 6, md: 10 }} bg="bg.card" borderRadius="3xl" borderWidth="1px" borderColor="border.soft" boxShadow="xl">
      <Heading size="lg" color="text.heading">
        {event ? 'Registration is closed' : 'Registration opens soon'}
      </Heading>
      <Text mt={3} color="text.muted">
        {event
          ? `Thank you for your interest in ${event.name}. Registrations are not being accepted right now.`
          : 'The next Vanabhojanam has not been announced yet. Please check back soon.'}
      </Text>
      <Text mt={4} fontSize="sm">
        Already registered?{' '}
        <Link as={RouterLink} to="/attendance" color="brand.600" fontWeight="bold" textDecoration="underline">
          View your QR code
        </Link>
      </Text>
      <Text mt={2} fontSize="sm" color="text.muted">
        Questions? <Link href={`mailto:${EVENT.contact.email}`} textDecoration="underline">{EVENT.contact.email}</Link>
      </Text>
    </Box>
  );
}
