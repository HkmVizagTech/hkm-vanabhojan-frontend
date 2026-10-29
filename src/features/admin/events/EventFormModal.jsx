import React, { useEffect, useState } from 'react';
import {
  Button, FormControl, FormLabel, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, SimpleGrid, Stack, Switch, Text, useToast,
} from '@chakra-ui/react';
import { eventsApi } from '../../../services/events';
import { getErrorMessage } from '../../../services/http';
import { toDateInput } from '../../../utils/event';
import FormField from '../../../components/common/FormField';

const blank = () => ({
  name: `Vanabhojanam ${new Date().getFullYear()}`,
  date: '',
  venueName: '',
  venueAddress: '',
  mapsUrl: '',
  feeCollege: '',
  feeWorking: '',
  ageMin: 16,
  ageMax: 31,
  registrationOpen: true,
});

const fromEvent = e => ({
  name: e.name,
  date: toDateInput(e.date),
  venueName: e.venue?.name || '',
  venueAddress: e.venue?.address || '',
  mapsUrl: e.venue?.mapsUrl || '',
  feeCollege: e.fees.college,
  feeWorking: e.fees.working,
  ageMin: e.ageMin,
  ageMax: e.ageMax,
  registrationOpen: e.registrationOpen,
});

const toPayload = f => ({
  name: f.name,
  date: f.date,
  venue: { name: f.venueName, address: f.venueAddress, mapsUrl: f.mapsUrl },
  fees: { college: Number(f.feeCollege), working: Number(f.feeWorking) },
  ageMin: Number(f.ageMin),
  ageMax: Number(f.ageMax),
  registrationOpen: f.registrationOpen,
});

/** Create or edit an edition. `event` null = create. `previous` pre-fills fees/venue from the last year. */
export default function EventFormModal({ isOpen, onClose, event, previous, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (event) setForm(fromEvent(event));
    else {
      // New year: start from last year's venue and fees so only the date has to change.
      const base = blank();
      setForm(previous ? { ...fromEvent(previous), name: base.name, date: '', registrationOpen: true } : base);
    }
  }, [isOpen, event, previous]);

  const bind = name => ({ value: form[name], onChange: e => setForm(prev => ({ ...prev, [name]: e.target.value })) });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      if (event) await eventsApi.update(event._id, payload);
      else await eventsApi.create(payload);
      toast({ title: event ? 'Event updated' : 'Event created', status: 'success', duration: 3000 });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the event'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="2xl">
        <ModalHeader>{event ? 'Edit event' : 'New Vanabhojanam'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormField id="ev-name" label="Event name" required>
              <Input {...bind('name')} />
            </FormField>
            <FormField id="ev-date" label="Event date" required>
              <Input type="date" {...bind('date')} />
            </FormField>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormField id="ev-fee-college" label="Student fee (₹)" required>
                <Input type="number" min="1" inputMode="numeric" {...bind('feeCollege')} />
              </FormField>
              <FormField id="ev-fee-working" label="Fee for others (₹)" required>
                <Input type="number" min="1" inputMode="numeric" {...bind('feeWorking')} />
              </FormField>
            </SimpleGrid>

            <FormField id="ev-venue" label="Venue name">
              <Input placeholder="Hare Krishna Vaikuntam Temple" {...bind('venueName')} />
            </FormField>
            <FormField id="ev-address" label="Venue address">
              <Input placeholder="IIM Road, Gambheeram, Visakhapatnam" {...bind('venueAddress')} />
            </FormField>
            <FormField id="ev-maps" label="Google Maps link" hint="Optional. If empty, a map search for the venue is used.">
              <Input placeholder="https://maps.app.goo.gl/..." {...bind('mapsUrl')} />
            </FormField>

            <SimpleGrid columns={2} spacing={4}>
              <FormField id="ev-age-min" label="Minimum age">
                <Input type="number" min="0" {...bind('ageMin')} />
              </FormField>
              <FormField id="ev-age-max" label="Maximum age">
                <Input type="number" min="0" {...bind('ageMax')} />
              </FormField>
            </SimpleGrid>

            <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} borderWidth="1px" borderRadius="xl">
              <FormLabel htmlFor="ev-open" mb={0}>
                Registration open
                <Text fontSize="xs" fontWeight="normal" color="text.muted">When off, the website shows "Registration is closed".</Text>
              </FormLabel>
              <Switch id="ev-open" colorScheme="brand" isChecked={form.registrationOpen} onChange={e => setForm(prev => ({ ...prev, registrationOpen: e.target.checked }))} />
            </FormControl>

            {error && <Text color="red.500" fontSize="sm" role="alert">{error}</Text>}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="festival" onClick={save} isLoading={saving}>{event ? 'Save changes' : 'Create event'}</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
