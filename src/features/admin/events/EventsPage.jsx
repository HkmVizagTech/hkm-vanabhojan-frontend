import React, { useState } from 'react';
import {
  Alert, AlertDescription, AlertIcon, Badge, Box, Button, Flex, Heading, HStack, SimpleGrid, Stack, Text, useDisclosure, useToast,
} from '@chakra-ui/react';
import { CalendarDays, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useAdminEvent } from '../../../context/AdminEventContext';
import { eventsApi } from '../../../services/events';
import { getErrorMessage } from '../../../services/http';
import { formatEventDate } from '../../../utils/event';
import { formatINR } from '../../../utils/format';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageSpinner from '../../../components/common/PageSpinner';
import PageHeader from '../PageHeader';
import EventFormModal from './EventFormModal';

const Metric = ({ label, value }) => (
  <Box>
    <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="text.muted" fontWeight="bold">{label}</Text>
    <Text fontSize="xl" fontWeight="extrabold" lineHeight="1.2">{value}</Text>
  </Box>
);

function EventCard({ event, onEdit, onSetCurrent, onToggleOpen, onDelete }) {
  const { stats } = event;
  return (
    <Box
      bg="bg.card"
      borderRadius="2xl"
      borderWidth="2px"
      borderColor={event.isCurrent ? 'brand.400' : 'border.soft'}
      p={5}
      boxShadow={event.isCurrent ? '0 14px 30px -18px rgba(32,96,61,0.7)' : 'none'}
    >
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Box>
          <Heading size="md" color="text.heading">{event.name}</Heading>
          <HStack mt={1} color="text.muted" fontSize="sm" spacing={4} flexWrap="wrap">
            <HStack><CalendarDays size={14} /><Text>{formatEventDate(event.date)}</Text></HStack>
            {event.venue?.name && <HStack><MapPin size={14} /><Text>{event.venue.name}</Text></HStack>}
          </HStack>
        </Box>
        <HStack>
          {event.isCurrent && <Badge colorScheme="green" borderRadius="full" px={3}>Current</Badge>}
          <Badge colorScheme={event.registrationOpen ? 'blue' : 'gray'} borderRadius="full" px={3}>
            {event.registrationOpen ? 'Registration open' : 'Registration closed'}
          </Badge>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={5}>
        <Metric label="Paid" value={stats.paid} />
        <Metric label="Attended" value={stats.attended} />
        <Metric label="Students / others" value={`${stats.students} / ${stats.others}`} />
        <Metric label="Revenue" value={formatINR(stats.revenue)} />
        <Metric label="Fees" value={`${formatINR(event.fees.college)} / ${formatINR(event.fees.working)}`} />
      </SimpleGrid>

      <HStack mt={5} spacing={2} flexWrap="wrap">
        <Button size="sm" leftIcon={<Pencil size={14} />} variant="outline" onClick={() => onEdit(event)}>Edit</Button>
        {!event.isCurrent && (
          <Button size="sm" leftIcon={<Star size={14} />} variant="outline" colorScheme="green" onClick={() => onSetCurrent(event)}>
            Make current
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onToggleOpen(event)}>
          {event.registrationOpen ? 'Close registration' : 'Open registration'}
        </Button>
        {stats.registrations === 0 && (
          <Button size="sm" leftIcon={<Trash2 size={14} />} variant="ghost" colorScheme="red" onClick={() => onDelete(event)}>Delete</Button>
        )}
      </HStack>
    </Box>
  );
}

export default function EventsPage() {
  const toast = useToast();
  const { events, legacy, loaded, refresh, current } = useAdminEvent();
  const form = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action, success) => {
    setBusy(true);
    try {
      await action();
      await refresh();
      if (success) toast({ title: success, status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Could not complete that', description: getErrorMessage(err), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBusy(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    form.onOpen();
  };
  const openEdit = event => {
    setEditing(event);
    form.onOpen();
  };

  if (!loaded) return <PageSpinner minH="60vh" />;

  return (
    <Box maxW="1100px" mx="auto">
      <PageHeader title="Events" subtitle="One entry for every Vanabhojanam. The current event is the one shown on the website.">
        <Button leftIcon={<Plus size={16} />} variant="festival" onClick={openNew}>New Vanabhojanam</Button>
      </PageHeader>

      {legacy > 0 && (
        <Alert status="info" borderRadius="xl" mb={4} alignItems="flex-start">
          <AlertIcon mt={1} />
          <AlertDescription>
            <b>{legacy} older registrations</b> are not attached to any event, so they only appear under "All events".
            {current && (
              <Button ml={2} size="xs" variant="outline" isLoading={busy} onClick={() => run(() => eventsApi.adoptLegacy(current._id), `Attached to ${current.name}`)}>
                Attach them to {current.name}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {events.length === 0 ? (
        <Stack align="center" textAlign="center" p={12} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft" spacing={3}>
          <Heading size="md">No events yet</Heading>
          <Text color="text.muted" maxW="md">
            Create this year's Vanabhojanam with its date, venue and fees. It goes live on the website straight away, and
            registrations are collected under it.
          </Text>
          <Button leftIcon={<Plus size={16} />} variant="festival" onClick={openNew}>Create the first event</Button>
        </Stack>
      ) : (
        <Stack spacing={4}>
          {events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={openEdit}
              onSetCurrent={e => run(() => eventsApi.setCurrent(e._id), `${e.name} is now the current event`)}
              onToggleOpen={e =>
                run(
                  () =>
                    eventsApi.update(e._id, {
                      name: e.name,
                      date: e.date,
                      venue: e.venue,
                      fees: e.fees,
                      ageMin: e.ageMin,
                      ageMax: e.ageMax,
                      registrationOpen: !e.registrationOpen,
                    }),
                  e.registrationOpen ? 'Registration closed' : 'Registration opened'
                )
              }
              onDelete={setToDelete}
            />
          ))}
        </Stack>
      )}

      <EventFormModal isOpen={form.isOpen} onClose={form.onClose} event={editing} previous={events[0]} onSaved={refresh} />

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await run(() => eventsApi.remove(toDelete._id), 'Event deleted');
          setToDelete(null);
        }}
        confirmLabel="Delete"
        title="Delete event"
        isLoading={busy}
      >
        Delete <strong>{toDelete?.name}</strong>? Events that already have registrations cannot be deleted.
      </ConfirmDialog>
    </Box>
  );
}
