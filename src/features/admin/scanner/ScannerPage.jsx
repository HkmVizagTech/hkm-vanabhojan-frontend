import React, { useRef, useState } from 'react';
import {
  Alert, AlertDescription, AlertIcon, AlertTitle, Badge, Box, Container, HStack, Select, Spinner, Stack, Text, VStack,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { Camera, CheckCircle2, History, TriangleAlert, XCircle } from 'lucide-react';
import { gsap, useGSAP } from '../../../lib/gsap';
import { ordinalYear } from '../../../utils/format';
import PageHeader from '../PageHeader';
import { useAttendanceScan } from './useAttendanceScan';
import { useQrScanner } from './useQrScanner';

const TONES = {
  success: { color: 'green', icon: CheckCircle2, ring: '#38a169' },
  warning: { color: 'orange', icon: TriangleAlert, ring: '#dd6b20' },
  error: { color: 'red', icon: XCircle, ring: '#e53e3e' },
};
const toneOf = result => (!result ? null : result.status === 'error' ? 'error' : result.status === 'already-marked' ? 'warning' : 'success');

function Corners({ color }) {
  const base = { position: 'absolute', width: '36px', height: '36px', borderColor: color, borderStyle: 'solid', transition: 'border-color .25s' };
  return (
    <>
      <Box {...base} top="12px" left="12px" borderWidth="4px 0 0 4px" borderTopLeftRadius="12px" />
      <Box {...base} top="12px" right="12px" borderWidth="4px 4px 0 0" borderTopRightRadius="12px" />
      <Box {...base} bottom="12px" left="12px" borderWidth="0 0 4px 4px" borderBottomLeftRadius="12px" />
      <Box {...base} bottom="12px" right="12px" borderWidth="0 4px 4px 0" borderBottomRightRadius="12px" />
    </>
  );
}

function MemberCard({ member }) {
  return (
    <Box p={3} borderRadius="lg" borderWidth="1px" bg={member.wasAlreadyScanned ? 'yellow.50' : 'green.50'} borderColor={member.wasAlreadyScanned ? 'yellow.300' : 'green.200'} _dark={{ bg: 'whiteAlpha.100' }}>
      <HStack mb={1} wrap="wrap">
        <Text fontWeight="bold">{member.name}</Text>
        <Badge colorScheme={member.wasAlreadyScanned ? 'yellow' : 'green'} variant="solid">
          {member.wasAlreadyScanned ? 'ALREADY SCANNED' : 'NEW SCAN'}
        </Badge>
      </HStack>
      {member.email && <Text fontSize="sm"><b>Email:</b> {member.email}</Text>}
      {member.gender && <Text fontSize="sm"><b>Gender:</b> {member.gender}</Text>}
      {member.college && <Text fontSize="sm"><b>College/Company:</b> {member.college}</Text>}
      {member.course && member.year && <Text fontSize="sm"><b>Course:</b> {member.course} - {ordinalYear(member.year)}</Text>}
    </Box>
  );
}

function ResultPanel({ result }) {
  const tone = TONES[toneOf(result)];
  const ref = useRef(null);
  useGSAP(() => {
    gsap.from(ref.current, { y: 16, opacity: 0, duration: 0.4, ease: 'power3.out' });
  }, { dependencies: [result.at], scope: ref });

  return (
    <VStack ref={ref} align="stretch" spacing={3} w="100%">
      <Alert status={tone.color === 'orange' ? 'warning' : tone.color === 'red' ? 'error' : 'success'} borderRadius="lg" variant="left-accent">
        <AlertIcon as={tone.icon} />
        <Box>
          <AlertTitle>{result.message || (result.status === 'error' ? 'Scan failed' : 'Scanned')}</AlertTitle>
          {result.scannedBy && <AlertDescription fontSize="sm">QR Code scanned by: <b>{result.scannedBy}</b></AlertDescription>}
        </Box>
      </Alert>
      {result.members.length > 0 && (
        <Box>
          <Text fontWeight="bold" color="text.heading" mb={2}>
            {result.total === 1 ? 'Registration Details:' : `Family Registration (${result.total} members):`}
          </Text>
          <Stack spacing={2}>
            {result.members.map((m, i) => <MemberCard key={m.id || m._id || i} member={m} />)}
          </Stack>
        </Box>
      )}
    </VStack>
  );
}

export default function ScannerPage() {
  const videoRef = useRef(null);
  const lineRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [deviceId, setDeviceId] = useState(null);
  const { result, history, handleDecode } = useAttendanceScan();
  const { devices, ready, error } = useQrScanner({ videoRef, onDecode: handleDecode, deviceId });
  const tone = toneOf(result);

  useGSAP(() => {
    if (reduced || !ready) return;
    gsap.fromTo(lineRef.current, { top: '8%' }, { top: '90%', duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true });
  }, { dependencies: [reduced, ready] });

  return (
    <Container maxW="lg" px={0}>
      <PageHeader title="Admin QR Scanner" subtitle="Hold a registration QR up to the camera" />
      <VStack spacing={4} bg="bg.card" p={{ base: 3, md: 5 }} borderRadius="2xl" borderWidth="1px" borderColor="border.soft" boxShadow="lg">
        <Box position="relative" w="100%" borderRadius="xl" overflow="hidden" bg="black" aspectRatio={1} outline="4px solid" outlineColor={tone ? TONES[tone].ring : 'transparent'} transition="outline-color .25s">
          <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Corners color={tone ? TONES[tone].ring : '#ffffff'} />
          {ready && !reduced && (
            <Box ref={lineRef} position="absolute" left="8%" right="8%" h="3px" borderRadius="full" bg="saffron.300" boxShadow="0 0 14px 2px rgba(246,171,46,0.9)" />
          )}
          {!ready && !error && (
            <VStack position="absolute" inset={0} justify="center" color="white" spacing={2}>
              <Spinner /> <Text fontSize="sm">Starting camera...</Text>
            </VStack>
          )}
        </Box>

        {devices.length > 1 && (
          <HStack w="100%">
            <Camera size={18} />
            <Select size="sm" aria-label="Camera" value={deviceId ?? ''} onChange={e => setDeviceId(e.target.value || null)}>
              <option value="">Default camera</option>
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>
              ))}
            </Select>
          </HStack>
        )}

        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result ? (
          <ResultPanel result={result} />
        ) : (
          ready && <Text color="text.muted" fontSize="sm">Waiting for a QR code...</Text>
        )}
      </VStack>

      {history.length > 0 && (
        <Box mt={5} p={4} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft">
          <HStack mb={2}><History size={16} /><Text fontWeight="bold">This session</Text></HStack>
          <Stack spacing={1}>
            {history.map(h => (
              <HStack key={`${h.token}-${h.at.getTime()}`} justify="space-between" fontSize="sm">
                <Text noOfLines={1}>{h.members.map(m => m.name).join(', ') || h.message}</Text>
                <HStack spacing={2} flexShrink={0}>
                  <Badge colorScheme={TONES[toneOf(h)].color}>{h.status === 'error' ? 'Error' : h.status === 'already-marked' ? 'Repeat' : 'OK'}</Badge>
                  <Text fontSize="xs" color="text.muted">{h.at.toLocaleTimeString()}</Text>
                </HStack>
              </HStack>
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
}
