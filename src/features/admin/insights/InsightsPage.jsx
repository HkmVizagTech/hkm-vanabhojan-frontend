import React from 'react';
import { Box, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { ArrowDownRight, ArrowUpRight, CheckCheck, IndianRupee, Percent, Repeat2, Users } from 'lucide-react';
import { eventsApi } from '../../../services/events';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useAdminEvent } from '../../../context/AdminEventContext';
import { formatEventDate } from '../../../utils/event';
import { formatINR } from '../../../utils/format';
import PageSpinner from '../../../components/common/PageSpinner';
import ErrorNotice from '../../../components/common/ErrorNotice';
import StatCard from '../../../components/common/StatCard';
import PageHeader from '../PageHeader';
import DataTable from '../DataTable';
import CompareBars from './CompareBars';
import FollowUpPanel from './FollowUpPanel';

const Delta = ({ now, before, suffix = '' }) => {
  if (before === undefined) return null;
  const diff = now - before;
  const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <HStack as="span" spacing={1} display="inline-flex" color={diff >= 0 ? 'green.500' : 'red.500'}>
      <Icon size={13} />
      <span>{Math.abs(diff)}{suffix} vs last</span>
    </HStack>
  );
};

const columns = [
  { key: 'name', header: 'Event', render: r => <Text fontWeight="bold">{r.name}</Text> },
  { key: 'date', header: 'Date', render: r => formatEventDate(r.date) },
  { key: 'paid', header: 'Paid', render: r => r.paid },
  { key: 'mix', header: 'Students / others', render: r => `${r.students} / ${r.others}` },
  { key: 'attended', header: 'Attended', render: r => r.attended },
  { key: 'rate', header: 'Turnout', render: r => `${r.attendanceRate}%` },
  { key: 'returning', header: 'Returning', render: r => r.returning },
  { key: 'revenue', header: 'Revenue', render: r => formatINR(r.revenue) },
];

export default function InsightsPage() {
  const { data, loading, error, reload } = useAsyncData(signal => eventsApi.analytics(signal), []);
  const { events } = useAdminEvent();

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  const latest = data[data.length - 1];
  const before = data[data.length - 2];

  return (
    <Box maxW="1200px" mx="auto">
      <PageHeader title="Insights" subtitle="How each Vanabhojanam compares, and who to invite back next year" />
      <ErrorNotice error={error} onRetry={reload} />

      {data.length === 0 ? (
        <Box p={10} textAlign="center" bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft">
          <Heading size="md">Nothing to compare yet</Heading>
          <Text mt={2} color="text.muted">Create an event under Events and the numbers appear here as people register.</Text>
        </Box>
      ) : (
        <>
          <Heading size="sm" mb={3} color="text.muted" textTransform="uppercase" letterSpacing="wider">{latest.name}</Heading>
          <SimpleGrid columns={{ base: 2, lg: 5 }} spacing={3} mb={8}>
            <StatCard label="Registered" value={latest.paid} icon={Users} hint={<Delta now={latest.paid} before={before?.paid} />} />
            <StatCard label="Attended" value={latest.attended} icon={CheckCheck} color="saffron" hint={<Delta now={latest.attended} before={before?.attended} />} />
            <StatCard label="Turnout" value={latest.attendanceRate} icon={Percent} color="lotus" format={n => `${Math.round(n)}%`} />
            <StatCard label="Revenue" value={latest.revenue} icon={IndianRupee} color="green" format={n => formatINR(n)} />
            <StatCard label="Returning" value={latest.returning} icon={Repeat2} color="orange" hint="Also came to an earlier one" />
          </SimpleGrid>

          <Heading size="md" mb={3} color="text.heading">Year by year</Heading>
          <Box bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft" p={{ base: 4, md: 6 }} mb={4}>
            <CompareBars rows={data} />
          </Box>
          <Box mb={10}>
            <DataTable columns={columns} rows={[...data].reverse()} rowKey="id" emptyText="No events" />
          </Box>
        </>
      )}

      <Heading size="md" mb={1} color="text.heading">Follow up</Heading>
      <Text color="text.muted" fontSize="sm" mb={3}>
        Find the people who came before but have not registered for the new event yet. Family members who share a WhatsApp number are one row.
      </Text>
      {events.length >= 2 ? (
        <FollowUpPanel events={events} />
      ) : (
        <Box p={6} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft">
          <Text color="text.muted">You need at least two events to follow up. Create next year's event under Events, and this fills in.</Text>
        </Box>
      )}
    </Box>
  );
}
