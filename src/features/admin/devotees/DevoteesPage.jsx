import React, { useRef, useState } from 'react';
import { Alert, AlertIcon, Badge, Box, Button, Card, CardBody, Heading, HStack, IconButton, Input, InputGroup, InputLeftAddon, SimpleGrid, Stack, Switch, Text, Textarea, useDisclosure, useToast } from '@chakra-ui/react';
import { FileUp, Trash2, UserPlus } from 'lucide-react';
import { devoteesApi } from '../../../services/devotees';
import { getErrorMessage } from '../../../services/http';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { formatDateTimeIST } from '../../../utils/format';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ErrorNotice from '../../../components/common/ErrorNotice';
import PageSpinner from '../../../components/common/PageSpinner';
import FormField from '../../../components/common/FormField';
import PageHeader from '../PageHeader';
import DataTable from '../DataTable';
import { parseDevoteeList } from './parseList';

export default function DevoteesPage() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsyncData(signal => devoteesApi.list(signal), []);
  const [one, setOne] = useState({ name: '', phone: '' });
  const [pasted, setPasted] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [report, setReport] = useState(null);
  const fileRef = useRef(null);
  const confirm = useDisclosure();

  const fail = (title, err) => toast({ title, description: getErrorMessage(err), status: 'error', duration: 5000, isClosable: true });

  const addOne = async e => {
    e.preventDefault();
    if (!one.name.trim() || one.phone.replace(/\D/g, '').length < 10) {
      return toast({ title: 'Enter a name and a 10-digit WhatsApp number', status: 'warning', duration: 3000 });
    }
    setBusy(true);
    try {
      const devotee = await devoteesApi.add({ name: one.name.trim(), whatsappNumber: one.phone });
      setData(prev => [...prev, devotee].sort((a, b) => a.name.localeCompare(b.name)));
      setOne({ name: '', phone: '' });
      toast({ title: `${devotee.name} added`, status: 'success', duration: 3000 });
    } catch (err) {
      fail('Could not add', err);
    } finally {
      setBusy(false);
    }
  };

  const addMany = async () => {
    const rows = parseDevoteeList(pasted);
    if (!rows.length) return toast({ title: 'Paste at least one line like "Name, 9876543210"', status: 'warning', duration: 3500 });
    setBusy(true);
    try {
      const result = await devoteesApi.addMany(rows);
      setReport(result);
      if (result.added) {
        setPasted('');
        reload();
      }
    } catch (err) {
      fail('Could not add the list', err);
    } finally {
      setBusy(false);
    }
  };

  const loadFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setPasted(await file.text());
  };

  const toggle = async d => {
    setBusyId(d._id);
    try {
      const updated = await devoteesApi.update(d._id, { active: !d.active });
      setData(prev => prev.map(x => (x._id === d._id ? updated : x)));
    } catch (err) {
      fail('Could not update', err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const target = toDelete;
    confirm.onClose();
    setBusyId(target._id);
    try {
      await devoteesApi.remove(target._id);
      setData(prev => prev.filter(x => x._id !== target._id));
      toast({ title: `${target.name} removed`, status: 'success', duration: 3000 });
    } catch (err) {
      fail('Could not remove', err);
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: d => <Text fontWeight="semibold">{d.name}</Text> },
    { key: 'phone', header: 'WhatsApp', render: d => d.whatsappNumber },
    { key: 'last', header: 'Last sign-in', render: d => (d.lastLoginAt ? formatDateTimeIST(d.lastLoginAt) : <Text color="text.muted">Never</Text>) },
    {
      key: 'access',
      header: 'Access',
      render: d => (
        <HStack spacing={2}>
          <Switch colorScheme="brand" isChecked={d.active} isDisabled={busyId === d._id} onChange={() => toggle(d)} aria-label={`${d.active ? 'Switch off' : 'Switch on'} ${d.name}`} />
          <Badge colorScheme={d.active ? 'green' : 'red'}>{d.active ? 'Can view' : 'Off'}</Badge>
        </HStack>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: d => (
        <IconButton aria-label={`Remove ${d.name}`} icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" isDisabled={busyId === d._id} onClick={() => { setToDelete(d); confirm.onOpen(); }} />
      ),
    },
  ];

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box>
      <PageHeader title="Devotees" subtitle="People who can sign in at /devotee with a WhatsApp code and look at registrations and attendance. View only." />
      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch devotees" />

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Heading size="sm" mb={3}>Add one devotee</Heading>
            <form onSubmit={addOne}>
              <Stack spacing={3}>
                <FormField id="devotee-name" label="Name" required>
                  <Input value={one.name} onChange={e => setOne(p => ({ ...p, name: e.target.value }))} placeholder="Devotee name" />
                </FormField>
                <FormField id="devotee-phone" label="WhatsApp number" required>
                  <InputGroup>
                    <InputLeftAddon>+91</InputLeftAddon>
                    <Input type="tel" inputMode="numeric" value={one.phone} onChange={e => setOne(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit number" />
                  </InputGroup>
                </FormField>
                <Button type="submit" leftIcon={<UserPlus size={16} />} isLoading={busy} alignSelf="flex-start">Add devotee</Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between" mb={3}>
              <Heading size="sm">Add a list</Heading>
              <Button size="xs" variant="outline" leftIcon={<FileUp size={14} />} onClick={() => fileRef.current?.click()}>Upload CSV</Button>
              <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={loadFile} />
            </HStack>
            <Textarea value={pasted} onChange={e => setPasted(e.target.value)} rows={6} placeholder={'One per line:\nHari Das, 9876543210\nRadha Devi, 9123456780'} />
            <Button mt={3} onClick={addMany} isLoading={busy} isDisabled={!pasted.trim()}>Add all</Button>
            {report && (
              <Alert status={report.invalid.length ? 'warning' : 'success'} mt={3} borderRadius="md" fontSize="sm" alignItems="flex-start">
                <AlertIcon />
                <Box>
                  Added {report.added}. {report.duplicates} already on the list.
                  {report.invalid.length > 0 && <> Skipped (name or number not valid): {report.invalid.join('; ')}</>}
                </Box>
              </Alert>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      <Text fontSize="sm" color="text.muted" mb={2}>{data.length} {data.length === 1 ? 'devotee' : 'devotees'}. A devotee signs in only if their number is here and their access is on.</Text>
      <DataTable columns={columns} rows={data} emptyText="No devotees yet. Add one above." />

      <ConfirmDialog isOpen={confirm.isOpen} onClose={confirm.onClose} onConfirm={remove} confirmLabel="Remove" title="Remove devotee">
        Remove <strong>{toDelete?.name}</strong>? They will be signed out and will not be able to sign in again.
      </ConfirmDialog>
    </Box>
  );
}
