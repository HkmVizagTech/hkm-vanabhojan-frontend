import React, { useMemo, useState } from 'react';
import {
  Alert, AlertDescription, AlertIcon, AlertTitle, Badge, Box, Button, Center, Container, Heading, HStack, Icon, Input,
  InputGroup, InputLeftAddon, Link, SimpleGrid, Text, VStack,
} from '@chakra-ui/react';
import { CheckCircle2, Clock, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EVENT } from '../../config/event';
import { formatDateTime, onlyDigits, ordinalYear } from '../../utils/format';
import PublicShell from '../../components/layout/PublicShell';
import FormField from '../../components/common/FormField';
import Figure from '../../components/three/Figure';
import { useQrLookup } from './useQrLookup';

function QrCard({ candidate }) {
  const attendedAt = candidate.adminAttendanceDate || candidate.attendanceDate;
  const attended = candidate.isAttended;
  return (
    <VStack
      spacing={3}
      p={4}
      borderRadius="2xl"
      borderWidth="2px"
      borderColor={attended ? 'green.300' : 'orange.300'}
      bg={attended ? 'green.50' : 'orange.50'}
      _dark={{ bg: 'whiteAlpha.100' }}
    >
      <HStack justify="center" wrap="wrap">
        <Text fontSize="lg" fontWeight="bold" color="text.heading">{candidate.name}</Text>
        <Badge colorScheme={attended ? 'green' : 'orange'}>{attended ? '✅ Attended' : '⏳ Not Attended'}</Badge>
      </HStack>
      {candidate.college && <Text fontSize="sm" color="text.muted">{candidate.college}</Text>}
      {candidate.course && candidate.year && (
        <Text fontSize="sm" color="text.muted">{candidate.course} - {ordinalYear(candidate.year)}</Text>
      )}
      <Box bg="white" p={3} borderRadius="lg" boxShadow="sm">
        <QRCodeSVG value={candidate.attendanceToken} size={168} />
      </Box>
      {attendedAt && <Text fontSize="xs" color="text.muted">Attended: {formatDateTime(attendedAt)}</Text>}
      {!attended && <Text fontSize="xs" color="orange.600" fontWeight="bold">📱 Show this QR to admin for attendance</Text>}
    </VStack>
  );
}

export default function QrLookupPage() {
  const [phone, setPhone] = useState('');
  const { loading, fieldError, notFound, error, candidates, total, lookup } = useQrLookup();

  const attended = useMemo(() => candidates.filter(c => c.isAttended).length, [candidates]);
  const pending = total - attended;

  const submit = async e => {
    e.preventDefault();
    if (await lookup(phone)) setPhone('');
  };

  return (
    <PublicShell>
      <Container maxW={candidates.length > 1 ? '2xl' : 'md'} py={{ base: 6, md: 12 }}>
        <Box bg="bg.card" borderRadius="3xl" p={{ base: 5, md: 8 }} boxShadow="xl" textAlign="center" borderWidth="1px" borderColor="border.soft">
          <Figure name="lotus" label="A blooming lotus" softEdges h="150px" mt={-2} />
          <Heading size="xl" color="text.heading">View QR Codes</Heading>
          <Text mb={6} mt={1} color="text.muted">
            Enter your WhatsApp mobile number to view all your QR codes for attendance.
          </Text>

          <form onSubmit={submit} noValidate>
            <FormField id="phone" label="WhatsApp Number" error={fieldError} textAlign="left">
              <InputGroup>
                <InputLeftAddon>+91</InputLeftAddon>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={e => setPhone(onlyDigits(e.target.value).slice(0, 10))}
                  maxLength={10}
                  autoComplete="tel-national"
                  letterSpacing="wide"
                  fontWeight="medium"
                  isDisabled={loading}
                />
              </InputGroup>
            </FormField>
            <Button mt={5} w="full" type="submit" variant="festival" size="lg" isLoading={loading} loadingText="Loading..." isDisabled={phone.length !== 10}>
              View QR Codes
            </Button>
          </form>

          {notFound && (
            <Alert status="warning" mt={6} borderRadius="lg" alignItems="flex-start" textAlign="left">
              <AlertIcon />
              <Box>
                <AlertTitle>Number not registered!</AlertTitle>
                <AlertDescription>
                  Please register here:{' '}
                  <Link href={EVENT.registrationUrl} isExternal fontWeight="bold" textDecoration="underline">{EVENT.registrationUrl}</Link>
                  <br />
                  And please visit the enquiry counter.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {error && (
            <Alert status="error" mt={6} borderRadius="lg" alignItems="flex-start" textAlign="left">
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          {candidates.length > 0 && (
            <Box mt={8}>
              <Center><Icon as={CheckCircle2} boxSize={12} color="green.400" /></Center>
              <Text mt={3} fontSize="xl" fontWeight="bold" color="text.heading">
                Found {total} registration{total > 1 ? 's' : ''} for this number
              </Text>
              <HStack justify="center" mt={2} color="brand.600"><QrCode size={18} /><Text>QR Code{total > 1 ? 's' : ''} for Attendance</Text></HStack>

              <SimpleGrid columns={{ base: 1, md: total > 2 ? 2 : 1 }} spacing={5} mt={5}>
                {candidates.map((c, i) => <QrCard key={c.id || i} candidate={c} />)}
              </SimpleGrid>

              <Box mt={6}>
                <Text fontWeight="bold" color="brand.600">
                  Show {total > 1 ? 'individual QR codes' : 'this QR code'} to admin for attendance.
                </Text>
                {total > 1 && <Text mt={1} fontSize="sm" color="text.muted">Each person must scan their own QR code individually.</Text>}
                <HStack justify="center" mt={3} spacing={4}>
                  {attended > 0 && <Badge colorScheme="green" fontSize="sm">✅ {attended} Attended</Badge>}
                  {pending > 0 && <Badge colorScheme="orange" fontSize="sm"><Icon as={Clock} boxSize={3} mr={1} />{pending} Pending</Badge>}
                </HStack>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </PublicShell>
  );
}
