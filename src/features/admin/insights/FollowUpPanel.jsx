import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Button, FormControl, FormLabel, HStack, Radio, RadioGroup, Select, SimpleGrid, Stack, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Download, Send } from 'lucide-react';
import { eventsApi } from '../../../services/events';
import { getErrorMessage } from '../../../services/http';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { usePagination } from '../../../hooks/usePagination';
import { exportToExcel } from '../../../utils/exportExcel';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ErrorNotice from '../../../components/common/ErrorNotice';
import Pagination from '../../../components/common/Pagination';
import DataTable from '../DataTable';

const AUDIENCES = [
  { value: 'attended', label: 'Came to that event', hint: 'Scanned at the gate' },
  { value: 'registered', label: 'Everyone who paid', hint: 'Whether or not they came' },
  { value: 'no_show', label: 'Paid but did not come', hint: 'Registered, no scan' },
];
const PAGE_SIZE = 25;
const tenDigits = phone => String(phone).replace(/^91/, '');

const columns = [
  { key: 'idx', header: '#', render: (_, i) => i + 1 },
  { key: 'name', header: 'Name', wrap: true, minW: '160px', render: p => <Text fontWeight="semibold">{p.names.join(', ')}</Text> },
  { key: 'phone', header: 'WhatsApp', render: p => tenDigits(p.phone) },
  { key: 'college', header: 'College / company', wrap: true, minW: '180px', render: p => p.college || '-' },
  { key: 'type', header: 'Type', render: p => (p.type === 'College' ? 'Student' : p.type === 'Working' ? 'Other' : '-') },
  { key: 'attended', header: 'Came', render: p => (p.attended ? 'Yes' : 'No') },
];

/** "Who should we invite back?": people from one edition who have not registered for another yet. */
export default function FollowUpPanel({ events }) {
  const toast = useToast();
  const confirm = useDisclosure();
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(b.date) - new Date(a.date)), [events]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [audience, setAudience] = useState('attended');
  const [sending, setSending] = useState(false);

  // Sensible defaults: invite last year's people to the newest event.
  useEffect(() => {
    if (!sorted.length || from || to) return;
    setTo((sorted.find(e => e.isCurrent) || sorted[0])._id);
    setFrom((sorted.find(e => !e.isCurrent) || sorted[sorted.length - 1])._id);
  }, [sorted, from, to]);

  const ready = Boolean(from && to && from !== to);
  const { data, loading, error, reload } = useAsyncData(
    signal => (ready ? eventsApi.followup({ from, to, audience }, signal) : Promise.resolve({ total: 0, alreadyRegistered: 0, people: [] })),
    { total: 0, alreadyRegistered: 0, people: [] },
    [from, to, audience, ready]
  );
  const { page, setPage, pageCount, pageItems, offset } = usePagination(data.people, PAGE_SIZE);
  const nameOf = id => sorted.find(e => e._id === id)?.name || '';

  const exportList = () =>
    exportToExcel({
      rows: data.people.map((p, i) => ({
        'S.No': i + 1,
        Name: p.names.join(', '),
        WhatsApp: tenDigits(p.phone),
        'College/Company': p.college,
        Type: p.type === 'College' ? 'Student' : 'Other',
        Email: p.email,
        [`Came to ${nameOf(from)}`]: p.attended ? 'Yes' : 'No',
      })),
      sheetName: 'Follow up',
      fileName: `follow-up-${nameOf(from)}-to-${nameOf(to)}.xlsx`.replace(/\s+/g, '-'),
    });

  const send = async () => {
    setSending(true);
    try {
      const result = await eventsApi.sendFollowup({ from, to, audience });
      toast({ title: `Sent ${result.sent} of ${result.total} invitations`, status: result.sent ? 'success' : 'warning', duration: 6000, isClosable: true });
      confirm.onClose();
    } catch (err) {
      toast({ title: 'Could not send invitations', description: getErrorMessage(err), status: 'error', duration: 8000, isClosable: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft" p={{ base: 4, md: 6 }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        <FormControl>
          <FormLabel>Invite people from</FormLabel>
          <Select value={from} onChange={e => setFrom(e.target.value)}>
            {sorted.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>to</FormLabel>
          <Select value={to} onChange={e => setTo(e.target.value)}>
            {sorted.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </FormControl>
      </SimpleGrid>

      <RadioGroup value={audience} onChange={setAudience} mb={4}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 2, md: 6 }}>
          {AUDIENCES.map(a => (
            <Radio key={a.value} value={a.value} colorScheme="brand">
              <Text fontWeight="semibold" lineHeight="1.2">{a.label}</Text>
              <Text fontSize="xs" color="text.muted">{a.hint}</Text>
            </Radio>
          ))}
        </Stack>
      </RadioGroup>

      {!ready ? (
        <Alert status="info" borderRadius="lg"><AlertIcon />Choose two different events to see who to follow up with.</Alert>
      ) : (
        <>
          <ErrorNotice error={error} onRetry={reload} />
          <HStack justify="space-between" flexWrap="wrap" mb={3} spacing={3}>
            <Text>
              <b>{data.people.length}</b> {data.people.length === 1 ? 'person' : 'people'} to invite
              {data.alreadyRegistered > 0 && <Text as="span" color="text.muted"> ({data.alreadyRegistered} already registered for {nameOf(to)})</Text>}
            </Text>
            <HStack>
              <Button size="sm" variant="outline" leftIcon={<Download size={14} />} onClick={exportList} isDisabled={!data.people.length}>
                Export to Excel
              </Button>
              <Button size="sm" variant="festival" leftIcon={<Send size={14} />} onClick={confirm.onOpen} isDisabled={!data.people.length}>
                Send WhatsApp invitation
              </Button>
            </HStack>
          </HStack>
          <DataTable columns={columns} rows={pageItems} rowKey="phone" offset={offset} emptyText={loading ? 'Loading...' : 'Nobody to follow up with for this selection.'} />
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={data.people.length} offset={offset} pageSize={PAGE_SIZE} />
        </>
      )}

      <ConfirmDialog isOpen={confirm.isOpen} onClose={confirm.onClose} onConfirm={send} confirmLabel="Send invitations" colorScheme="green" title="Send WhatsApp invitations" isLoading={sending}>
        This sends the approved invitation template to <strong>{data.people.length}</strong> people, inviting them to <strong>{nameOf(to)}</strong>.
        <Text fontSize="sm" color="text.muted" mt={2}>Each person receives one message. This cannot be undone.</Text>
      </ConfirmDialog>
    </Box>
  );
}
