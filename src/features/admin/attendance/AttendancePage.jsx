import React, { useMemo, useState } from 'react';
import { Badge, Box, Button, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { AlertTriangle, CheckCircle2, Download, Percent, Phone, User, Users } from 'lucide-react';
import { candidatesApi } from '../../../services/candidates';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { usePagination } from '../../../hooks/usePagination';
import { exportToExcel } from '../../../utils/exportExcel';
import { areaKey, areaOptions, inDateRange, matchesSearch, uniqueSorted } from '../../../utils/filters';
import { formatDate, formatDateTime } from '../../../utils/format';
import PageSpinner from '../../../components/common/PageSpinner';
import ErrorNotice from '../../../components/common/ErrorNotice';
import Pagination from '../../../components/common/Pagination';
import StatCard from '../../../components/common/StatCard';
import PageHeader from '../PageHeader';
import EventSwitcher from '../EventSwitcher';
import { useAdminEvent } from '../../../context/AdminEventContext';
import DataTable from '../DataTable';
import { FilterBar, InputFilter, SelectFilter } from '../FilterBar';

const PAGE_SIZE = 50;

const isAttendee = c => c.paymentStatus === 'Paid';
const hasAttended = c => Boolean(c.adminAttendance || c.attendance);
const attendedAt = c => c.adminAttendanceDate || c.attendanceDate;

const byPhoneThenName = (a, b) =>
  (a.whatsappNumber || '').localeCompare(b.whatsappNumber || '') || (a.name || '').localeCompare(b.name || '');

const columns = [
  { key: 'idx', header: '#', render: (_, i) => i + 1 },
  {
    key: 'name',
    header: 'Name',
    render: c => (
      <HStack spacing={2}>
        <Text fontWeight="semibold">{c.name}</Text>
        {c.family && <Badge colorScheme="blue">Family ({c.family.attended}/{c.family.size})</Badge>}
      </HStack>
    ),
  },
  { key: 'gender', header: 'Gender', render: c => c.gender },
  {
    key: 'phone',
    header: 'Phone',
    render: c => (
      <HStack spacing={1}>
        <Phone size={13} color="#38a169" />
        <Text fontSize="sm">{c.whatsappNumber}</Text>
      </HStack>
    ),
  },
  { key: 'college', header: 'College/Company', minW: '180px', wrap: true, render: c => <Text fontSize="sm">{c.college}</Text> },
  { key: 'branch', header: 'Branch', render: c => c.branch },
  { key: 'area', header: 'Area', minW: '120px', wrap: true, render: c => c.area || '-' },
  { key: 'email', header: 'Email', render: c => <Text fontSize="sm" noOfLines={1} maxW="160px" title={c.email}>{c.email}</Text> },
  {
    key: 'attendance',
    header: 'Attendance',
    render: c =>
      hasAttended(c) ? (
        <HStack spacing={2}><CheckCircle2 size={16} color="#38a169" /><Badge colorScheme="green">Attended</Badge></HStack>
      ) : (
        <HStack spacing={2}><AlertTriangle size={16} color="#dd6b20" /><Badge colorScheme="orange">Not Attended</Badge></HStack>
      ),
  },
  { key: 'attDate', header: 'Attendance Date', render: c => formatDateTime(attendedAt(c)) || '-' },
  { key: 'regDate', header: 'Registration Date', render: c => formatDate(c.registrationDate) || '-' },
];

const familyRowProps = c =>
  c.family ? { bg: 'blue.50', _dark: { bg: 'whiteAlpha.100' }, borderLeft: '4px solid', borderLeftColor: 'blue.300' } : undefined;

const toExcelRow = (row, idx) => ({
  'S.No': idx + 1,
  Name: row.name,
  Gender: row.gender,
  Email: row.email,
  'College/Company': row.college,
  Branch: row.branch,
  Area: row.area,
  Phone: row.whatsappNumber,
  Attendance: hasAttended(row) ? 'Yes' : 'No',
  'Attendance Date': formatDateTime(attendedAt(row)),
  'Registration Date': formatDateTime(row.registrationDate),
});

const GENDER_OPTIONS = ['Male', 'Female'];
const ATTENDANCE_OPTIONS = [{ value: 'attended', label: 'Attended' }, { value: 'not-attended', label: 'Not attended' }];

export default function AttendancePage() {
  const { selected, loaded } = useAdminEvent();
  const { data, loading, error, reload } = useAsyncData(
    // Only paid registrations are attendees. Pending and Failed rows are payment attempts (one person can have several),
    // and Refunded ones are no longer coming, so none of them belong in an attendance list.
    async signal => (loaded ? (await candidatesApi.list(selected, signal)).filter(isAttendee).sort(byPhoneThenName) : []),
    [],
    [selected, loaded]
  );
  const [filters, setFilters] = useState({ college: '', area: '', gender: '', attendance: '', start: '', end: '', search: '' });
  const search = useDebouncedValue(filters.search);
  const setFilter = name => value => setFilters(prev => ({ ...prev, [name]: value }));

  const colleges = useMemo(() => uniqueSorted(data.map(c => c.college)), [data]);
  const areas = useMemo(() => areaOptions(data.map(c => c.area)), [data]);

  const filtered = useMemo(() => {
    const rows = data.filter(c => {
      const date = attendedAt(c) || c.registrationDate;
      return (
        (!filters.college || c.college === filters.college) &&
        (!filters.area || areaKey(c.area) === filters.area) &&
        (!filters.gender || c.gender === filters.gender) &&
        (!filters.attendance || hasAttended(c) === (filters.attendance === 'attended')) &&
        inDateRange(date, filters.start, filters.end) &&
        matchesSearch([c.name, c.email, c.whatsappNumber, c.college, c.branch, c.area], search)
      );
    });
    // One pass to group family members (same WhatsApp number) instead of a scan per row.
    const groups = new Map();
    rows.forEach(c => {
      const g = groups.get(c.whatsappNumber) || { size: 0, attended: 0 };
      g.size += 1;
      if (hasAttended(c)) g.attended += 1;
      groups.set(c.whatsappNumber, g);
    });
    return rows.map(c => {
      const g = groups.get(c.whatsappNumber);
      return g.size > 1 ? { ...c, family: g } : c;
    });
  }, [data, filters.college, filters.area, filters.gender, filters.attendance, filters.start, filters.end, search]);

  const male = useMemo(() => filtered.filter(c => c.gender === 'Male').length, [filtered]);
  const female = useMemo(() => filtered.filter(c => c.gender === 'Female').length, [filtered]);
  const attended = useMemo(() => filtered.filter(hasAttended).length, [filtered]);
  const { page, setPage, pageCount, pageItems, offset } = usePagination(filtered, PAGE_SIZE);

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box>
      <PageHeader title="All Registrations & Attendance" subtitle="Paid registrations only. Family members share a WhatsApp number and are grouped together">
        <EventSwitcher />
        <Button leftIcon={<Download size={16} />} onClick={() => exportToExcel({ rows: filtered.map(toExcelRow), sheetName: 'All Registrations', fileName: 'all-registrations-attendance.xlsx' })} isDisabled={filtered.length === 0}>
          Export to Excel
        </Button>
      </PageHeader>

      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch candidates list" />

      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} mb={4}>
        <StatCard label="Total registrations" value={filtered.length} icon={Users} />
        <StatCard label="Attended" value={attended} icon={CheckCircle2} color="green" />
        <StatCard label="Not attended" value={filtered.length - attended} icon={Percent} color="orange" hint={filtered.length ? `${Math.round((attended / filtered.length) * 100)}% turnout` : undefined} />
        <StatCard label="Male" value={male} icon={User} color="blue" />
        <StatCard label="Female" value={female} icon={User} color="pink" />
      </SimpleGrid>

      <FilterBar columns={{ base: 1, sm: 2, lg: 6 }}>
        <SelectFilter label="College/Company" placeholder="All" value={filters.college} onChange={setFilter('college')} options={colleges} />
        <SelectFilter label="Area" placeholder="All areas" value={filters.area} onChange={setFilter('area')} options={areas} />
        <SelectFilter label="Gender" placeholder="All" value={filters.gender} onChange={setFilter('gender')} options={GENDER_OPTIONS} />
        <SelectFilter label="Attendance" placeholder="All" value={filters.attendance} onChange={setFilter('attendance')} options={ATTENDANCE_OPTIONS} />
        <InputFilter label="From" type="date" value={filters.start} onChange={setFilter('start')} />
        <InputFilter label="To" type="date" value={filters.end} onChange={setFilter('end')} />
        <InputFilter label="Search" placeholder="Phone number shows the whole family..." value={filters.search} onChange={setFilter('search')} />
      </FilterBar>

      <DataTable columns={columns} rows={pageItems} offset={offset} rowProps={familyRowProps} emptyText="No registration records found." />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} offset={offset} pageSize={PAGE_SIZE} />
    </Box>
  );
}
