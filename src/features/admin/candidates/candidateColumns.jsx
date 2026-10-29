import React from 'react';
import { Box, Button, chakra, HStack, Image, Tag, Text, Tooltip, VStack } from '@chakra-ui/react';
import { AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { formatDate } from '../../../utils/format';
import { ADMIN_ACTION_COLORS, PAYMENT_COLORS } from './constants';

const openInNewTab = url => e => {
  e.stopPropagation();
  window.open(url, '_blank', 'noopener');
};

function IdCardCell({ candidate }) {
  if (candidate.studentIdCardUrl) {
    return (
      <VStack spacing={2}>
        <Image
          src={candidate.studentIdCardUrl}
          alt="Student ID Card"
          loading="lazy"
          boxSize="60px"
          objectFit="cover"
          borderRadius="md"
          borderWidth="1px"
          cursor="pointer"
          onClick={openInNewTab(candidate.studentIdCardUrl)}
        />
        <Button size="xs" colorScheme="blue" variant="outline" onClick={openInNewTab(candidate.studentIdCardUrl)}>
          View Full
        </Button>
      </VStack>
    );
  }
  const missing = candidate.collegeOrWorking === 'College';
  return (
    <VStack spacing={1}>
      <Box
        boxSize="60px"
        display="grid"
        placeItems="center"
        borderRadius="md"
        borderWidth={missing ? '2px' : '1px'}
        borderStyle={missing ? 'dashed' : 'solid'}
        borderColor={missing ? 'red.200' : 'border.soft'}
        bg={missing ? 'red.50' : 'bg.subtle'}
        _dark={{ bg: missing ? 'red.900' : 'bg.subtle' }}
      >
        {missing ? <AlertTriangle size={18} color="#f56565" /> : <Text fontSize="xs" color="text.muted">N/A</Text>}
      </Box>
      <Text fontSize="xs" color={missing ? 'red.500' : 'text.muted'}>{missing ? 'No ID Card' : 'Working Prof.'}</Text>
    </VStack>
  );
}

/** Module-level so DataTable's memoised rows keep a stable reference. */
export const candidateColumns = [
  { key: 'idx', header: '#', render: (_, i) => i + 1 },
  {
    key: 'name',
    header: 'Name',
    render: c => (
      <Box>
        <Text fontWeight="semibold">{c.name}</Text>
        <Text fontSize="xs" color="text.muted">{c.serialNo || '-'}</Text>
      </Box>
    ),
  },
  { key: 'gender', header: 'Gender', render: c => c.gender },
  {
    key: 'phone',
    header: 'Phone',
    render: c => (
      <Tooltip label={c.whatsappNumber} fontSize="xs">
        <HStack spacing={1}>
          <Phone size={13} color="#38a169" />
          <Text fontSize="sm">{c.whatsappNumber}</Text>
        </HStack>
      </Tooltip>
    ),
  },
  {
    key: 'college',
    header: 'College/Company',
    minW: '180px',
    wrap: true,
    render: c => <Text fontSize="sm">{c.college || <chakra.span color="blue.500">{c.companyName || '-'}</chakra.span>}</Text>,
  },
  { key: 'course', header: 'Course', render: c => c.course || '-' },
  { key: 'year', header: 'Year', render: c => c.year || '-' },
  { key: 'idcard', header: 'ID Card', render: c => <IdCardCell candidate={c} /> },
  { key: 'reg', header: 'Reg Date', render: c => formatDate(c.registrationDate) || 'N/A' },
  {
    key: 'payment',
    header: 'Payment',
    render: c => <Tag size="sm" colorScheme={PAYMENT_COLORS[c.paymentStatus] || 'gray'}>{c.paymentStatus}</Tag>,
  },
  {
    key: 'method',
    header: 'Method',
    render: c => <Tag size="sm" colorScheme={c.paymentMethod ? 'orange' : 'gray'}>{c.paymentMethod || '-'}</Tag>,
  },
  {
    key: 'source',
    header: 'Source',
    render: c => (
      <Tooltip label={c.howDidYouKnow || 'Not specified'} fontSize="xs">
        <Text fontSize="sm" noOfLines={1} maxW="120px">
          {c.howDidYouKnow || <chakra.span color="text.muted">-</chakra.span>}
        </Text>
      </Tooltip>
    ),
  },
  {
    key: 'attendance',
    header: 'Attendance',
    render: c => (c.attendance ? <CheckCircle2 size={18} color="#48bb78" /> : <AlertTriangle size={18} color="#a0aec0" />),
  },
  {
    key: 'action',
    header: 'Admin Action',
    render: c =>
      c.adminAction ? (
        <Tag size="sm" variant="solid" colorScheme={ADMIN_ACTION_COLORS[c.adminAction] || 'gray'}>{c.adminAction}</Tag>
      ) : (
        <Tag size="sm" variant="outline" colorScheme="gray">Pending</Tag>
      ),
  },
];
