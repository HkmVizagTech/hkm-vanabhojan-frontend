import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Button, SimpleGrid, Text, useDisclosure } from '@chakra-ui/react';
import { CheckCheck, Clock, Download, IndianRupee, User, UserCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi } from '../../../services/candidates';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { usePagination } from '../../../hooks/usePagination';
import { exportToExcel } from '../../../utils/exportExcel';
import { areaKey, areaOptions, inDateRange, matchesSearch, uniqueSorted } from '../../../utils/filters';
import { formatDateTime, formatDateTimeIST, formatINR } from '../../../utils/format';
import PageSpinner from '../../../components/common/PageSpinner';
import ErrorNotice from '../../../components/common/ErrorNotice';
import Pagination from '../../../components/common/Pagination';
import StatCard from '../../../components/common/StatCard';
import StatusChips from '../../../components/common/StatusChips';
import { useAuth } from '../../../context/AuthContext';
import { useAdminEvent } from '../../../context/AdminEventContext';
import EventSwitcher from '../EventSwitcher';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Reveal from '../../../components/common/Reveal';
import PageHeader from '../PageHeader';
import DataTable from '../DataTable';
import { FilterBar, InputFilter, SelectFilter } from '../FilterBar';
import { candidateColumns } from './candidateColumns';
import CandidateDetailModal from './CandidateDetailModal';
import RazorpayCheck from './RazorpayCheck';
import { useCandidateActions } from './useCandidateActions';
import { awaitingApproval, matchesApproval } from './needsApproval';
import { ACTION_COPY, PAYMENT_COLORS, PAYMENT_STATUSES } from './constants';

const PAGE_SIZE = 50;

// A row whose accept / reject / refund is still being finished on the server: greyed out and not clickable.
const rowProps = row => (row._busy ? { opacity: 0.45, pointerEvents: 'none', filter: 'grayscale(1)' } : undefined);

const toExcelRow = (row, index) => ({
  'S.No': index + 1,
  Name: row.name,
  Gender: row.gender,
  Email: row.email,
  Area: row.area,
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
  'Registration Date': formatDateTimeIST(row.registrationDate),
  'Student ID Card URL': row.studentIdCardUrl || 'N/A',
  Attendance: row.attendance ? 'Yes' : 'No',
  'Admin Action': row.adminAction || 'Pending',
  'Admin Action Date': formatDateTime(row.adminActionDate),
  'Receipt No': row.receipt,
});

const TYPE_OPTIONS = [{ value: 'College', label: 'Students' }, { value: 'Working', label: 'Working' }];
const APPROVAL_OPTIONS = [
  { value: 'verify', label: 'To verify' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
];

export default function CandidatesPage() {
  const navigate = useNavigate();
  const readOnly = useAuth().role === 'viewer'; // devotees look, they never change anything
  const { selected: eventId, loaded, events } = useAdminEvent();
  const { data, loading, error, reload, setData } = useAsyncData(
    signal => (loaded ? candidatesApi.list(eventId, signal) : Promise.resolve([])),
    [],
    [eventId, loaded]
  );
  const eventName = events.find(e => e._id === eventId)?.name;
  const [filters, setFilters] = useState({ college: '', area: '', gender: '', type: '', approval: '', payment: '', start: '', end: '', search: '' });
  const [selectedId, setSelectedId] = useState(null);
  const { isOpen: isDetailOpen, onOpen: openDetail, onClose: closeDetail } = useDisclosure();
  const search = useDebouncedValue(filters.search);

  const setFilter = name => value => setFilters(prev => ({ ...prev, [name]: value }));
  // The "Awaiting action" card: show the students still to verify in the table (click again to clear).
  const toggleVerify = () => setFilters(prev => ({ ...prev, approval: prev.approval === 'verify' ? '' : 'verify', payment: '' }));

  const handleUpdated = useCallback(
    (id, patch) => setData(prev => prev.map(c => (c._id === id ? { ...c, ...patch } : c))),
    [setData]
  );
  const dataRef = useRef(data);
  dataRef.current = data;
  const getCandidate = useCallback(id => dataRef.current.find(c => c._id === id), []);
  const actions = useCandidateActions({ onUpdated: handleUpdated, getCandidate, onStart: closeDetail });

  const selected = useMemo(() => data.find(c => c._id === selectedId) || null, [data, selectedId]);
  const colleges = useMemo(() => uniqueSorted(data.map(c => c.college)), [data]);
  const areas = useMemo(() => areaOptions(data.map(c => c.area)), [data]);

  // Everything except the status chip, so each chip can show how many it would give.
  const baseFiltered = useMemo(
    () =>
      data.filter(
        c =>
          (!filters.college || c.college === filters.college) &&
          (!filters.area || areaKey(c.area) === filters.area) &&
          (!filters.gender || c.gender === filters.gender) &&
          (!filters.type || c.collegeOrWorking === filters.type) &&
          matchesApproval(c, filters.approval) &&
          inDateRange(c.registrationDate, filters.start, filters.end) &&
          matchesSearch([c.name, c.email, c.whatsappNumber, c.college, c.companyName, c.area], search)
      ),
    [data, filters.college, filters.area, filters.gender, filters.type, filters.approval, filters.start, filters.end, search]
  );
  const filtered = useMemo(
    () => (filters.payment ? baseFiltered.filter(c => c.paymentStatus === filters.payment) : baseFiltered),
    [baseFiltered, filters.payment]
  );

  // The cards follow the filters: pick Students or Working (or a college, dates, a status) and the totals change with them.
  const overview = useMemo(() => {
    const paid = filtered.filter(c => c.paymentStatus === 'Paid');
    const sumOf = type => paid.filter(c => c.collegeOrWorking === type).reduce((sum, c) => sum + (Number(c.paymentAmount) || 0), 0);
    return {
      total: filtered.length,
      paid: paid.length,
      revenue: paid.reduce((sum, c) => sum + (Number(c.paymentAmount) || 0), 0),
      students: sumOf('College'),
      working: sumOf('Working'),
      attended: filtered.filter(c => c.attendance).length,
      awaiting: filtered.filter(awaitingApproval).length,
      malePaid: paid.filter(c => c.gender === 'Male').length,
      femalePaid: paid.filter(c => c.gender === 'Female').length,
    };
  }, [filtered]);

  // Each status pill shows how many people and how much money: success (Paid), Pending, Failed and Refunded.
  const chips = useMemo(
    () => [
      { value: '', label: 'All', count: baseFiltered.length, color: 'brand' },
      ...PAYMENT_STATUSES.map(s => {
        const rows = baseFiltered.filter(c => c.paymentStatus === s);
        return {
          value: s,
          label: s,
          count: rows.length,
          amount: formatINR(rows.reduce((sum, c) => sum + (Number(c.paymentAmount) || 0), 0)),
          color: PAYMENT_COLORS[s],
        };
      }),
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
        {!readOnly && <RazorpayCheck eventId={eventId} />}
        <Button variant="outline" leftIcon={<Clock size={16} />} onClick={() => navigate('/admin/attendance')}>
          Go to Attendance
        </Button>
        <Button leftIcon={<Download size={16} />} onClick={handleExport} isDisabled={filtered.length === 0}>
          Export to Excel
        </Button>
      </PageHeader>

      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch data" />

      <Reveal stagger={0.08} mb={5}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          <StatCard label="Registrations" value={overview.total} icon={Users} />
          <StatCard label="Paid" value={overview.paid} icon={CheckCheck} color="green" />
          <StatCard label="Revenue" value={overview.revenue} icon={IndianRupee} color="saffron" format={n => formatINR(n)} hint={filters.type ? `${overview.paid} paid` : `Students ${formatINR(overview.students)} · Working ${formatINR(overview.working)}`} />
          <StatCard label="Attended" value={overview.attended} icon={UserCheck} color="lotus" hint={overview.paid ? `${Math.round((overview.attended / overview.paid) * 100)}% of paid` : undefined} />
          <StatCard label="Male (paid)" value={overview.malePaid} icon={User} color="blue" />
          <StatCard label="Female (paid)" value={overview.femalePaid} icon={User} color="pink" />
          <StatCard
            label="Awaiting action"
            value={overview.awaiting}
            icon={Clock}
            color="orange"
            hint="Student IDs to verify"
            active={filters.approval === 'verify'}
            onClick={overview.awaiting > 0 || filters.approval === 'verify' ? toggleVerify : undefined}
          />
        </SimpleGrid>
      </Reveal>

      <FilterBar columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
        <SelectFilter label="Type" placeholder="All types" value={filters.type} onChange={setFilter('type')} options={TYPE_OPTIONS} />
        <SelectFilter label="Student ID" placeholder="Any" value={filters.approval} onChange={setFilter('approval')} options={APPROVAL_OPTIONS} />
        <SelectFilter label="College" placeholder="All colleges" value={filters.college} onChange={setFilter('college')} options={colleges} />
        <SelectFilter label="Area" placeholder="All areas" value={filters.area} onChange={setFilter('area')} options={areas} />
        <SelectFilter label="Gender" placeholder="All" value={filters.gender} onChange={setFilter('gender')} options={['Male', 'Female']} />
        <InputFilter label="From" type="date" value={filters.start} onChange={setFilter('start')} />
        <InputFilter label="To" type="date" value={filters.end} onChange={setFilter('end')} />
        <InputFilter label="Search" placeholder="Name, email, phone, college..." value={filters.search} onChange={setFilter('search')} />
      </FilterBar>

      <Box mb={3}>
        <StatusChips options={chips} value={filters.payment} onChange={setFilter('payment')} />
        <Text mt={2} fontSize="xs" color="text.muted">Showing {filtered.length} records. Click any row for details{readOnly ? '' : ' and actions'}.</Text>
      </Box>

      <DataTable
        columns={candidateColumns}
        rows={pageItems}
        offset={offset}
        onRowClick={openCandidate}
        rowProps={rowProps}
        emptyText="No candidates found."
      />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} offset={offset} pageSize={PAGE_SIZE} />

      <CandidateDetailModal
        candidate={selected}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onAction={actions.request}
        busy={actions.busyId === selected?._id}
        readOnly={readOnly}
      />

      <ConfirmDialog
        isOpen={Boolean(actions.pending)}
        onClose={actions.cancel}
        onConfirm={actions.confirm}
        colorScheme={pendingCopy?.colorScheme}
        confirmLabel={`Confirm ${actions.pending?.action ?? ''}`}
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
