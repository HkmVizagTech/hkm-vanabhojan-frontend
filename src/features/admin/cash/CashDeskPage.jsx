import React, { useState } from 'react';
import {
  Alert, AlertDescription, AlertIcon, Badge, Box, Button, Center, Checkbox, Flex, Heading, HStack, Input, InputGroup, InputLeftAddon,
  Radio, RadioGroup, SimpleGrid, Stack, Text, VStack, useToast,
} from '@chakra-ui/react';
import { BadgeIndianRupee, CheckCircle2, Send, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cashApi } from '../../../services/cash';
import { getErrorMessage } from '../../../services/http';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { formatDateTime, formatINR, onlyDigits } from '../../../utils/format';
import FormField from '../../../components/common/FormField';
import StatCard from '../../../components/common/StatCard';
import PageSpinner from '../../../components/common/PageSpinner';
import ErrorNotice from '../../../components/common/ErrorNotice';
import PageHeader from '../PageHeader';
import DataTable from '../DataTable';

const empty = { name: '', whatsappNumber: '', gender: '', collegeOrWorking: '', college: '', email: '', checkIn: false };

/** Only what the desk needs: name, number, gender, and student/other (which sets the fee). */
const validate = f => {
  const e = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!/^\d{10}$/.test(f.whatsappNumber)) e.whatsappNumber = 'Enter a valid 10-digit number';
  if (!f.gender) e.gender = 'Please select gender';
  if (!f.collegeOrWorking) e.collegeOrWorking = 'Choose student or other';
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email';
  return e;
};

const TypeButton = ({ active, onClick, label, fee }) => (
  <Box
    as="button"
    type="button"
    onClick={onClick}
    aria-pressed={active}
    flex="1"
    p={3}
    borderRadius="xl"
    borderWidth="2px"
    borderColor={active ? 'brand.500' : 'border.soft'}
    bg={active ? 'brand.50' : 'bg.card'}
    _dark={{ bg: active ? 'whiteAlpha.200' : 'bg.card' }}
    textAlign="left"
    transition="all .15s"
  >
    <Text fontWeight="bold">{label}</Text>
    <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="text.heading" lineHeight="1.1">{fee != null ? formatINR(fee) : '-'}</Text>
  </Box>
);

function QrStatus({ row, onResend, busy }) {
  const sent = row.qrSendStatus === 'sent';
  return (
    <HStack spacing={2}>
      <Badge colorScheme={sent ? 'green' : 'red'}>{sent ? 'QR sent' : 'Not sent'}</Badge>
      <Button size="xs" variant="outline" leftIcon={<Send size={12} />} isLoading={busy} onClick={() => onResend(row)}>
        {sent ? 'Resend' : 'Send QR'}
      </Button>
    </HStack>
  );
}

export default function CashDeskPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(signal => cashApi.list(signal), { event: null, totals: { people: 0, amount: 0 }, registrations: [] });
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null); // result of the last registration
  const [resendingId, setResendingId] = useState(null);

  const fees = data.event?.fees;
  const feeFor = type => (type === 'College' ? fees?.college : type === 'Working' ? fees?.working : null);
  const amount = feeFor(form.collegeOrWorking);

  const set = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  };

  const submit = async e => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const result = await cashApi.register({
        name: form.name.trim(),
        whatsappNumber: form.whatsappNumber,
        gender: form.gender,
        collegeOrWorking: form.collegeOrWorking,
        college: form.collegeOrWorking === 'College' ? form.college.trim() : '',
        email: form.email.trim(),
        checkIn: form.checkIn,
      });
      setDone(result);
      setForm(empty);
      reload();
    } catch (err) {
      toast({ title: 'Could not register', description: getErrorMessage(err), status: 'error', duration: 7000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const resend = async row => {
    setResendingId(row.id);
    try {
      const result = await cashApi.sendQr(row.id);
      toast({
        title: result.whatsapp.ok ? 'QR sent on WhatsApp' : 'Could not send the QR',
        description: result.whatsapp.ok ? undefined : result.whatsapp.error,
        status: result.whatsapp.ok ? 'success' : 'warning',
        duration: 5000,
        isClosable: true,
      });
      if (done?.candidate.id === row.id) setDone(prev => ({ ...prev, whatsapp: result.whatsapp }));
      reload();
    } catch (err) {
      toast({ title: 'Could not send the QR', description: getErrorMessage(err), status: 'error', duration: 6000, isClosable: true });
    } finally {
      setResendingId(null);
    }
  };

  const columns = [
    { key: 'idx', header: '#', render: (_, i) => i + 1 },
    { key: 'name', header: 'Name', render: r => <Text fontWeight="semibold">{r.name}</Text> },
    { key: 'phone', header: 'WhatsApp', render: r => r.whatsappNumber.replace(/^91/, '') },
    { key: 'type', header: 'Type', render: r => (r.collegeOrWorking === 'College' ? 'Student' : 'Other') },
    { key: 'amount', header: 'Cash', render: r => formatINR(r.paymentAmount) },
    { key: 'by', header: 'Taken by', render: r => r.collectedBy },
    { key: 'time', header: 'Time', render: r => formatDateTime(r.cashCollectedAt) },
    { key: 'qr', header: 'QR', render: r => <QrStatus row={r} onResend={resend} busy={resendingId === r.id} /> },
  ];

  if (loading && !data.event && data.registrations.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box maxW="1100px" mx="auto">
      <PageHeader title="Cash desk" subtitle={data.event ? `${data.event.name}: take cash from walk-ins and send their QR on WhatsApp` : 'Take cash from walk-ins'} />
      <ErrorNotice error={error} onRetry={reload} />

      {!data.event && !loading && (
        <Alert status="warning" borderRadius="xl" mb={4}>
          <AlertIcon />
          <AlertDescription>There is no current event yet. Ask an admin to create one under Events.</AlertDescription>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mb={5}>
        <StatCard label="People registered" value={data.totals.people} icon={UserPlus} />
        <StatCard label="Cash collected" value={data.totals.amount} icon={BadgeIndianRupee} color="saffron" format={n => formatINR(n)} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={5} mb={8} alignItems="flex-start">
        <Box gridColumn={{ lg: 'span 3' }} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft" p={{ base: 4, md: 6 }}>
          <Heading size="md" mb={4} color="text.heading">New walk-in</Heading>
          <form onSubmit={submit} noValidate>
            <Stack spacing={4}>
              <FormField id="cash-name" label="Name" required error={errors.name}>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" autoComplete="off" />
              </FormField>
              <FormField id="cash-phone" label="WhatsApp number" required error={errors.whatsappNumber} hint="The QR pass is sent to this number">
                <InputGroup>
                  <InputLeftAddon>+91</InputLeftAddon>
                  <Input value={form.whatsappNumber} onChange={e => set('whatsappNumber', onlyDigits(e.target.value).slice(0, 10))} type="tel" inputMode="numeric" placeholder="10-digit number" autoComplete="off" />
                </InputGroup>
              </FormField>
              <FormField id="cash-gender" label="Gender" required error={errors.gender}>
                <RadioGroup value={form.gender} onChange={v => set('gender', v)}>
                  <HStack spacing={6}>
                    <Radio value="Male" colorScheme="brand">Male</Radio>
                    <Radio value="Female" colorScheme="brand">Female</Radio>
                  </HStack>
                </RadioGroup>
              </FormField>
              <FormField id="cash-type" label="Student or other?" required error={errors.collegeOrWorking}>
                <HStack spacing={3} align="stretch">
                  <TypeButton active={form.collegeOrWorking === 'College'} onClick={() => set('collegeOrWorking', 'College')} label="College student" fee={fees?.college} />
                  <TypeButton active={form.collegeOrWorking === 'Working'} onClick={() => set('collegeOrWorking', 'Working')} label="Other" fee={fees?.working} />
                </HStack>
              </FormField>

              <Box borderTopWidth="1px" borderColor="border.soft" pt={3}>
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted" mb={3}>Optional</Text>
                <Stack spacing={3}>
                  {form.collegeOrWorking === 'College' && (
                    <FormField id="cash-college" label="College">
                      <Input value={form.college} onChange={e => set('college', e.target.value)} placeholder="College name" autoComplete="off" />
                    </FormField>
                  )}
                  <FormField id="cash-email" label="Email" error={errors.email}>
                    <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" autoComplete="off" />
                  </FormField>
                  <Checkbox colorScheme="brand" isChecked={form.checkIn} onChange={e => set('checkIn', e.target.checked)}>
                    <Text fontWeight="semibold" lineHeight="1.2">Also mark as arrived now</Text>
                    <Text fontSize="xs" color="text.muted">Use when they are entering right away, so the QR need not be scanned.</Text>
                  </Checkbox>
                </Stack>
              </Box>

              <Button type="submit" variant="festival" size="lg" py={7} isLoading={saving} loadingText="Saving" isDisabled={!data.event} leftIcon={<BadgeIndianRupee size={20} />}>
                {amount != null ? `Cash received ${formatINR(amount)}: send QR` : 'Cash received: send QR'}
              </Button>
            </Stack>
          </form>
        </Box>

        <Box gridColumn={{ lg: 'span 2' }}>
          {done ? (
            <VStack bg="bg.card" borderRadius="2xl" borderWidth="2px" borderColor={done.whatsapp.ok ? 'green.300' : 'orange.300'} p={5} spacing={3} textAlign="center">
              <Center><CheckCircle2 size={34} color="#38a169" /></Center>
              <Heading size="md">{done.candidate.name}</Heading>
              <Text color="text.muted" fontSize="sm">{formatINR(done.amount)} received in cash{done.candidate.checkedIn ? ' · marked as arrived' : ''}</Text>
              <Box bg="white" p={3} borderRadius="lg" boxShadow="sm"><QRCodeSVG value={done.candidate.attendanceToken} size={170} /></Box>
              {done.whatsapp.ok ? (
                <Badge colorScheme="green" px={3} py={1} borderRadius="full">QR sent on WhatsApp to {done.candidate.whatsappNumber.replace(/^91/, '')}</Badge>
              ) : (
                <>
                  <Alert status="warning" borderRadius="lg" fontSize="sm" textAlign="left"><AlertIcon />Registered, but the WhatsApp could not be sent: {done.whatsapp.error}</Alert>
                  <Button size="sm" leftIcon={<Send size={14} />} isLoading={resendingId === done.candidate.id} onClick={() => resend(done.candidate)}>Try sending again</Button>
                  <Text fontSize="xs" color="text.muted">They can also see their QR any time at the website's "View your QR code" page with their number.</Text>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setDone(null)}>Done</Button>
            </VStack>
          ) : (
            <Flex bg="bg.subtle" borderRadius="2xl" p={6} direction="column" align="center" textAlign="center" color="text.muted">
              <BadgeIndianRupee size={32} />
              <Text mt={2} fontWeight="semibold">Fill in the walk-in's details</Text>
              <Text fontSize="sm">After you take the cash, their QR pass appears here and goes to their WhatsApp.</Text>
            </Flex>
          )}
        </Box>
      </SimpleGrid>

      <Heading size="md" mb={3} color="text.heading">Cash taken so far</Heading>
      <DataTable columns={columns} rows={data.registrations} rowKey="id" emptyText="No cash registrations yet." />
    </Box>
  );
}
