import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, SimpleGrid, Text, useDisclosure } from '@chakra-ui/react';
import { CheckCheck, Clock, Download, IndianRupee, UserCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi } from '../../../services/candidates';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { usePagination } from '../../../hooks/usePagination';
import { exportToExcel } from '../../../utils/exportExcel';
import { inDateRange, matchesSearch, uniqueSorted } from '../../../utils/filters';
import { formatDateTime, formatINR } from '../../../utils/format';
import PageSpinner from '../../../components/common/PageSpinner';
import ErrorNotice from '../../../components/common/ErrorNotice';
import Pagination from '../../../components/common/Pagination';
import StatCard from '../../../components/common/StatCard';
import StatusChips from '../../../components/common/StatusChips';
import { useAdminEvent } from '../../../context/AdminEventContext';
import EventSwitcher from '../EventSwitcher';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Reveal from '../../../components/common/Reveal';
import PageHeader from '../PageHeader';
import DataTable from '../DataTable';
import { FilterBar, InputFilter, SelectFilter } from '../FilterBar';
import { candidateColumns } from './candidateColumns';
import CandidateDetailModal from './CandidateDetailModal';
import { useCandidateActions } from './useCandidateActions';
import { ACTION_COPY, PAYMENT_COLORS, PAYMENT_STATUSES } from './constants';

const PAGE_SIZE = 50;

const toExcelRow = row => ({
  'S.No': row.serialNo,
  Name: row.name,
  Gender: row.gender,
  Email: row.email,
  College: row.college,
  'Company Name': row.companyName,
  Course: row.course,
  'College/Working': row.collegeOrWorking,
  Year: row.year,
  Phone: row.whatsappNumber,
  'Order ID': row.orderId,
  'Payment Amount': row.paymentAmount,
  'Payment Date': formatDateTime(row.paymentDate),
  'Payment Status': row.paymentStatus,
  'Payment Method': row.paymentMethod,
  'How Found': row.howDidYouKnow || 'Not specified',
  'Registration Date': formatDateTime(row.registrationDate),
  'Student ID Card URL': row.studentIdCardUrl || 'N/A',
  Attendance: row.attendance ? 'Yes' : 'No',
  'Admin Action': row.adminAction || 'Pending',
  'Admin Action Date': formatDateTime(row.adminActionDate),
  'Receipt No': row.receipt,
});

export default function CandidatesPage() {
  const navigate = useNavigate();
  const { selected: eventId, loaded, events } = useAdminEvent();
  const { data, loading, error, reload, setData } = useAsyncData(
    signal => (loaded ? candidatesApi.list(eventId, signal) : Promise.resolve([])),
    [],
    [eventId, loaded]
  );
  const eventName = events.find(e => e._id === eventId)?.name;
  const [filters, setFilters] = useState({ college: '', payment: '', start: '', end: '', search: '' });
  const [selectedId, setSelectedId] = useState(null);
  const { isOpen: isDetailOpen, onOpen: openDetail, onClose: closeDetail } = useDisclosure();
  const search = useDebouncedValue(filters.search);

  const setFilter = name => value => setFilters(prev => ({ ...prev, [name]: value }));

  const handleUpdated = useCallback(
    (id, patch) => setData(prev => prev.map(c => (c._id === id ? { ...c, ...patch } : c))),
    [setData]
  );
  const actions = useCandidateActions({ onUpdated: handleUpdated });

  const selected = useMemo(() => data.find(c => c._id === selectedId) || null, [data, selectedId]);
  const colleges = useMemo(() => uniqueSorted(data.map(c => c.college)), [data]);

  // Everything except the status chip, so each chip can show how many it would give.
  const baseFiltered = useMemo(
    () =>
      data.filter(
        c =>
          (!filters.college || c.college === filters.college) &&
          inDateRange(c.registrationDate, filters.start, filters.end) &&
          matchesSearch([c.name, c.email, c.whatsappNumber, c.college, c.companyName], search)
      ),
    [data, filters.college, filters.start, filters.end, search]
  );
  const filtered = useMemo(
    () => (filters.payment ? baseFiltered.filter(c => c.paymentStatus === filters.payment) : baseFiltered),
    [baseFiltered, filters.payment]
  );

  const overview = useMemo(() => {
    const paid = data.filter(c => c.paymentStatus === 'Paid');
    return {
      total: data.length,
      paid: paid.length,
      revenue: paid.reduce((sum, c) => sum + (Number(c.paymentAmount) || 0), 0),
      attended: data.filter(c => c.attendance).length,
      awaiting: paid.filter(c => !c.adminAction).length,
    };
  }, [data]);

  const chips = useMemo(
    () => [
      { value: '', label: 'All', count: baseFiltered.length, color: 'brand' },
      ...PAYMENT_STATUSES.map(s => ({
        value: s,
        label: s,
        count: baseFiltered.filter(c => c.paymentStatus === s).length,
        color: PAYMENT_COLORS[s],
      })),
    ],
    [baseFiltered]
  );

  const { page, setPage, pageCount, pageItems, offset } = usePagination(filtered, PAGE_SIZE);

  const openCandidate = useCallback(
    candidate => {
      setSelectedId(candidate._id);
      openDetail();
    },
    [openDetail]
  );

  const handleExport = () =>
    exportToExcel({ rows: filtered.map(toExcelRow), sheetName: 'Candidates', fileName: `candidates-${(eventName || 'all-events').replace(/\s+/g, '-')}.xlsx` });

  const pendingCopy = actions.pending ? ACTION_COPY[actions.pending.action] : null;

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box>
      <PageHeader title="Candidate List" subtitle="Registrations, payments and approvals">
        <EventSwitcher />
        <Button variant="outline" leftIcon={<Clock size={16} />} onClick={() => navigate('/admin/attendance')}>
          Go to Attendance
        </Button>
        <Button leftIcon={<Download size={16} />} onClick={handleExport} isDisabled={filtered.length === 0}>
          Export to Excel
        </Button>
      </PageHeader>

      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch data" />

      <Reveal stagger={0.08} mb={5}>
        <SimpleGrid columns={{ base: 2, lg: 5 }} spacing={3}>
          <StatCard label="Registrations" value={overview.total} icon={Users} />
          <StatCard label="Paid" value={overview.paid} icon={CheckCheck} color="green" />
          <StatCard label="Revenue" value={overview.revenue} icon={IndianRupee} color="saffron" format={n => formatINR(n)} />
          <StatCard label="Attended" value={overview.attended} icon={UserCheck} color="lotus" hint={overview.paid ? `${Math.round((overview.attended / overview.paid) * 100)}% of paid` : undefined} />
          <StatCard label="Awaiting action" value={overview.awaiting} icon={Clock} color="orange" hint="Paid, not yet accepted/rejected" />
        </SimpleGrid>
      </Reveal>

      <FilterBar columns={{ base: 1, sm: 2, lg: 4 }}>
        <SelectFilter label="College" placeholder="All colleges" value={filters.college} onChange={setFilter('college')} options={colleges} />
        <InputFilter label="From" type="date" value={filters.start} onChange={setFilter('start')} />
        <InputFilter label="To" type="date" value={filters.end} onChange={setFilter('end')} />
        <InputFilter label="Search" placeholder="Name, email, phone, college..." value={filters.search} onChange={setFilter('search')} />
      </FilterBar>

      <Box mb={3}>
        <StatusChips options={chips} value={filters.payment} onChange={setFilter('payment')} />
        <Text mt={2} fontSize="xs" color="text.muted">Showing {filtered.length} records. Click any row for details and actions.</Text>
      </Box>

      <DataTable
        columns={candidateColumns}
        rows={pageItems}
        offset={offset}
        onRowClick={openCandidate}
        emptyText="No candidates found."
      />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} offset={offset} pageSize={PAGE_SIZE} />

      <CandidateDetailModal
        candidate={selected}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onAction={actions.request}
        busy={actions.busyId === selected?._id}
      />

      <ConfirmDialog
        isOpen={Boolean(actions.pending)}
        onClose={actions.cancel}
        onConfirm={actions.confirm}
        colorScheme={pendingCopy?.colorScheme}
        confirmLabel={`Confirm ${actions.pending?.action ?? ''}`}
        isLoading={Boolean(actions.busyId)}
      >
        {pendingCopy && (
          <>
            Are you sure you want to <strong>{actions.pending.action}</strong> {pendingCopy.target}?
            <Text fontSize="sm" color="text.muted" mt={2}>{pendingCopy.note}</Text>
          </>
        )}
      </ConfirmDialog>
    </Box>
  );
}
