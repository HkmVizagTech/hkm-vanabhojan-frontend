import React from 'react';
import { Box, Button, Container, HStack, Icon, Link, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import { CalendarDays, CalendarPlus, MapPin, Navigation, Ticket, Users } from 'lucide-react';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { downloadEventIcs } from '../../utils/calendar';
import { formatINR } from '../../utils/format';
import Reveal from '../../components/common/Reveal';

function Tile({ icon, label, children }) {
  return (
    <HStack align="flex-start" spacing={3} p={{ base: 3, md: 4 }}>
      <Box p={2.5} borderRadius="xl" bg="brand.50" color="brand.600" _dark={{ bg: 'brand.900', color: 'brand.200' }}>
        <Icon as={icon} boxSize={5} />
      </Box>
      <VStack align="flex-start" spacing={0}>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted">
          {label}
        </Text>
        {children}
      </VStack>
    </HStack>
  );
}

export default function EventStrip() {
  const { event } = useCurrentEvent();
  if (!event) return null;
  return (
    <Container maxW="5xl" mt={{ base: 0, md: -8 }} position="relative" zIndex={2}>
      <Reveal>
        <Box bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft" boxShadow="0 18px 50px -24px rgba(32,96,61,0.5)">
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }}>
            <Tile icon={CalendarDays} label="Date">
              <Text fontWeight="bold">{event.dateLabel}</Text>
            </Tile>
            <Tile icon={MapPin} label="Venue">
              <Text fontWeight="bold">{event.venue.name}</Text>
              <Text fontSize="sm" color="text.muted">{event.venue.address}</Text>
            </Tile>
            <Tile icon={Ticket} label="Registration fee">
              <Text fontWeight="bold">
                <Text as="span" color="brand.600" _dark={{ color: 'brand.200' }}>{formatINR(event.fees.College.amount)}</Text> students
              </Text>
              <Text fontSize="sm" color="text.muted">{formatINR(event.fees.Working.amount)} others</Text>
            </Tile>
            <Tile icon={Users} label="Age">
              <Text fontWeight="bold">{event.ageLimit.label}</Text>
              <Text fontSize="sm" color="text.muted">only</Text>
            </Tile>
          </SimpleGrid>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} px={4} pb={4} justify="center">
            <Button size="sm" variant="outline" leftIcon={<CalendarPlus size={16} />} onClick={() => downloadEventIcs(event)}>
              Add to calendar
            </Button>
            <Button as={Link} href={event.venue.mapsUrl} isExternal size="sm" variant="outline" leftIcon={<Navigation size={16} />} _hover={{ textDecoration: 'none' }}>
              Get directions
            </Button>
          </Stack>
        </Box>
      </Reveal>
    </Container>
  );
}
