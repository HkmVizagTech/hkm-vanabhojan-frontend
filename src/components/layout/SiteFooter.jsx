import React from 'react';
import { Box, Button, Container, Flex, Heading, HStack, Image, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { CalendarDays, Mail, MapPin, QrCode } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { EVENT, MAHAMANTRA } from '../../config/event';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import Reveal from '../common/Reveal';
import logo from '../../assets/logo.svg';

const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function FooterLink({ children, ...props }) {
  return (
    <Link color="whiteAlpha.800" _hover={{ color: 'saffron.200', textDecoration: 'none' }} fontSize="sm" {...props}>
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  const { event } = useCurrentEvent();
  return (
    <Box as="footer" mt={{ base: 20, md: 28 }} pt={{ base: 14, md: 20 }} pb={8} color="white" bg="brand.800" position="relative" overflow="hidden">
      <Container maxW="6xl" position="relative">
        <Reveal textAlign="center" maxW="3xl" mx="auto">
          <Text fontFamily="deva" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.9" color="saffron.200">
            {MAHAMANTRA.devanagari}
          </Text>
          <Text mt={2} fontFamily="heading" fontSize={{ base: 'md', md: 'lg' }} fontStyle="italic" opacity={0.9}>
            {MAHAMANTRA.roman}
          </Text>
        </Reveal>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 10, md: 12 }} mt={{ base: 12, md: 16 }} pt={{ base: 10, md: 12 }} borderTopWidth="1px" borderColor="whiteAlpha.200">
          <Stack spacing={4}>
            <HStack spacing={3}>
              <Image src={logo} alt="" boxSize="46px" borderRadius="full" />
              <Heading as="p" size="md" fontFamily="heading" color="white">Vanabhojanam</Heading>
            </HStack>
            <Text fontSize="sm" color="whiteAlpha.800" maxW="xs">
              {EVENT.tagline}. A youth festival by {EVENT.organiser}.
            </Text>
          </Stack>

          <Stack spacing={3}>
            <Text fontSize="xs" fontWeight="extrabold" letterSpacing="0.2em" textTransform="uppercase" color="saffron.200">Explore</Text>
            <FooterLink as="button" type="button" textAlign="left" onClick={() => scrollTo('highlights')}>Highlights</FooterLink>
            <FooterLink as="button" type="button" textAlign="left" onClick={() => scrollTo('how')}>How it works</FooterLink>
            <FooterLink as="button" type="button" textAlign="left" onClick={() => scrollTo('faq')}>FAQ</FooterLink>
            <FooterLink as={RouterLink} to="/attendance"><HStack as="span" spacing={2}><QrCode size={14} /><span>View my QR</span></HStack></FooterLink>
          </Stack>

          <Stack spacing={3}>
            <Text fontSize="xs" fontWeight="extrabold" letterSpacing="0.2em" textTransform="uppercase" color="saffron.200">Visit & contact</Text>
            {event && (
              <>
                <HStack align="flex-start" spacing={2} fontSize="sm" color="whiteAlpha.900"><CalendarDays size={16} style={{ marginTop: 3 }} /><Text>{event.dateLabel}</Text></HStack>
                {(event.venue.name || event.venue.address) && (
                  <HStack align="flex-start" spacing={2} fontSize="sm" color="whiteAlpha.900">
                    <MapPin size={16} style={{ marginTop: 3, flexShrink: 0 }} />
                    <Text>{[event.venue.name, event.venue.address].filter(Boolean).join(', ')}</Text>
                  </HStack>
                )}
                <Button as={Link} href={event.venue.mapsUrl} isExternal size="sm" variant="outline" color="white" borderColor="whiteAlpha.400" w="fit-content" _hover={{ bg: 'whiteAlpha.200', textDecoration: 'none' }}>
                  Open in Maps
                </Button>
              </>
            )}
            <HStack align="center" spacing={2} fontSize="sm"><Mail size={16} /><FooterLink href={`mailto:${EVENT.contact.email}`}>{EVENT.contact.email}</FooterLink></HStack>
          </Stack>
        </SimpleGrid>

        <Flex mt={12} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.200" justify="space-between" direction={{ base: 'column', sm: 'row' }} gap={2} fontSize="xs" color="whiteAlpha.700" textAlign="center">
          <Text>© {new Date().getFullYear()} {EVENT.organiser}</Text>
          <Text>Hare Krishna 🙏</Text>
        </Flex>
      </Container>
    </Box>
  );
}
