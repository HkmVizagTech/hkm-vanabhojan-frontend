import React, { useMemo, useState } from 'react';
import { Box, HStack, Tag, Text } from '@chakra-ui/react';
import { CheckCircle2, Phone } from 'lucide-react';
import { attendanceApi } from '../../../services/attendance';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { usePagination } from '../../../hooks/usePagination';
import { inDateRange, matchesSearch, matchesTimeOfDay, uniqueSorted } from '../../../utils/filters';
import { formatDateTime } from '../../../utils/format';
import PageSpinner from '../../../components/common/PageSpinner';
import ErrorNotice from '../../../components/common/ErrorNotice';
import Pagination from '../../../components/common/Pagination';
import PageHeader from '../PageHeader';
import EventSwitcher from '../EventSwitcher';
import StatCard from '../../../components/common/StatCard';
import { useAdminEvent } from '../../../context/AdminEventContext';
import { ScanLine } from 'lucide-react';
import DataTable from '../DataTable';
import { FilterBar, InputFilter, SelectFilter } from '../FilterBar';

const PAGE_SIZE = 50;

const normalise = record => ({
  ...record,
  phone: record.whatsappNumber || record.phone,
  branch: record.branch || record.course,
});

const columns = [
  { key: 'idx', header: '#', render: (_, i) => i + 1 },
  { key: 'name', header: 'Name', render: c => <Text fontWeight="semibold">{c.name}</Text> },
  { key: 'email', header: 'Email', render: c => <Text fontSize="sm" noOfLines={1} maxW="160px" title={c.email}>{c.email}</Text> },
  { key: 'gender', header: 'Gender', render: c => c.gender || '' },
  {
    key: 'phone',
    header: 'Phone',
    render: c => (
      <HStack spacing={1}>
        <Phone size={13} color="#38a169" />
        <Text fontSize="sm">{c.phone}</Text>
      </HStack>
    ),
  },
  { key: 'college', header: 'College', wrap: true, minW: '160px', render: c => <Text fontSize="sm">{c.college || ''}</Text> },
  { key: 'branch', header: 'Branch', render: c => c.branch || '' },
  { key: 'scannedAt', header: 'Scanned At', render: c => formatDateTime(c.adminAttendanceDate) },
  {
    key: 'status',
    header: 'Status',
    render: () => (
      <Tag colorScheme="green" size="sm">
        <CheckCircle2 size={13} style={{ marginRight: 4 }} /> Scanned
      </Tag>
    ),
  },
];

export default function ScannedListPage() {
  const { selected, loaded } = useAdminEvent();
  const { data, loading, error, reload } = useAsyncData(
    async signal => (loaded ? (await attendanceApi.listScanned(selected, signal)).map(normalise) : []),
    [],
    [selected, loaded]
  );
  const [filters, setFilters] = useState({ college: '', start: '', end: '', search: '', time: '' });
  const search = useDebouncedValue(filters.search);
  const setFilter = name => value => setFilters(prev => ({ ...prev, [name]: value }));

  const colleges = useMemo(() => uniqueSorted(data.map(c => c.college)), [data]);
  const filtered = useMemo(
    () =>
      data.filter(
        c =>
          (!filters.college || c.college === filters.college) &&
          inDateRange(c.adminAttendanceDate, filters.start, filters.end) &&
          matchesSearch([c.name, c.email, c.phone, c.college, c.branch], search) &&
          matchesTimeOfDay(c.adminAttendanceDate, filters.time, filters.start)
      ),
    [data, filters.college, filters.start, filters.end, filters.time, search]
  );
  const { page, setPage, pageCount, pageItems, offset } = usePagination(filtered, PAGE_SIZE);

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box>
      <PageHeader title="Admin Scanned Attendance List" subtitle="Everyone checked in at the gate">
        <EventSwitcher />
      </PageHeader>

      <Box maxW="260px" mb={4}>
        <StatCard label="Total scanned" value={filtered.length} icon={ScanLine} color="green" />
      </Box>

      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch scanned attendance" />

      <FilterBar>
        <SelectFilter label="College" placeholder="All colleges" value={filters.college} onChange={setFilter('college')} options={colleges} />
        <InputFilter label="From" type="date" value={filters.start} onChange={setFilter('start')} />
        <InputFilter label="To" type="date" value={filters.end} onChange={setFilter('end')} />
        <InputFilter label="Search" placeholder="Name, email, phone, college..." value={filters.search} onChange={setFilter('search')} />
        <SelectFilter
          label="Time of Day"
          placeholder="All"
          value={filters.time}
          onChange={setFilter('time')}
          options={[{ value: 'morning', label: 'Morning' }, { value: 'evening', label: 'Evening' }]}
        />
      </FilterBar>

      <DataTable columns={columns} rows={pageItems} offset={offset} emptyText="No scanned attendance records found." />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} offset={offset} pageSize={PAGE_SIZE} />
    </Box>
  );
}
