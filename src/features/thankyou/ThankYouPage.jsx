import React, { useRef } from 'react';
import {
  Box, Button, Center, Container, Flex, Heading, HStack, Icon, Image, Link, SimpleGrid, Spinner, Stack, Text, VStack,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { ArrowLeft, CalendarDays, CalendarPlus, CheckCircle2, Mail, MapPin, MessageCircle, Navigation, Phone, QrCode, XCircle } from 'lucide-react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { EVENT, HIGHLIGHTS } from '../../config/event';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { gsap, useGSAP } from '../../lib/gsap';
import { downloadEventIcs } from '../../utils/calendar';
import { formatINR } from '../../utils/format';
import PublicShell from '../../components/layout/PublicShell';
import Figure from '../../components/three/Figure';
import logo from '../../assets/newLogo.png';
import { usePaymentStatus } from './usePaymentStatus';

function StatusCard({ icon, title, color, children }) {
  return (
    <Container maxW="lg" py={20}>
      <VStack spacing={4} textAlign="center" bg="bg.card" borderRadius="3xl" p={{ base: 6, md: 10 }} boxShadow="xl" borderWidth="1px" borderColor="border.soft">
        {icon}
        <Heading size="lg" color={color}>{title}</Heading>
        {children}
      </VStack>
    </Container>
  );
}

function InfoRow({ icon, title, children }) {
  return (
    <Flex align="center" gap={3} p={3} bg="brand.50" _dark={{ bg: 'whiteAlpha.100' }} borderRadius="lg">
      <Icon as={icon} boxSize={5} color="brand.600" />
      <Box>
        <Text fontWeight="semibold">{title}</Text>
        <Text fontSize="sm" color="text.muted">{children}</Text>
      </Box>
    </Flex>
  );
}

function SuccessView({ candidate, paymentId }) {
  const navigate = useNavigate();
  const { event } = useCurrentEvent();
  const root = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from('.ty-reveal', { y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' });
      gsap.from('.ty-check', { scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(2.4)', delay: 0.2 });
    },
    { scope: root, dependencies: [reduced] }
  );

  const shareText = encodeURIComponent(
    `I just registered for ${event?.title || EVENT.title}${event ? ` on ${event.dateLabel} at ${event.venue.name}` : ''}. Join me! ${EVENT.registrationUrl}`
  );

  return (
    <Container ref={root} maxW="2xl" py={{ base: 4, md: 10 }}>
      <Flex align="center" justify="center" gap={4} mb={4} className="ty-reveal" flexWrap="wrap">
        <Box position="relative" minW="96px">
          <Image src={logo} alt="Vanabhojanam Youth Festival Logo" boxSize="96px" borderRadius="full" shadow="lg" bg="white" />
          <Center className="ty-check" position="absolute" top="-2" right="-2" bg="green.500" borderRadius="full" p={1}>
            <Icon as={CheckCircle2} boxSize={6} color="white" />
          </Center>
        </Box>
        <Box>
          <Heading size="lg" lineHeight="short">VANABHOJANAM <br /> Youth Festival</Heading>
          <Text fontWeight="semibold" mt={1} color="text.muted">{EVENT.tagline}</Text>
        </Box>
      </Flex>

      <Box className="ty-reveal" bgGradient="linear(to-r, brand.600, brand.400)" color="white" p={6} borderRadius="2xl" shadow="xl" textAlign="center" mb={2}>
        <Heading fontSize="3xl" mb={1}>Registration Successful!</Heading>
        <Text fontSize="lg" opacity={0.92}>Welcome to {event?.title || EVENT.title}</Text>
      </Box>
      <Box className="ty-reveal" mb={4}>
        <Figure name="lotus" label="A blooming lotus" softEdges h="220px" />
      </Box>

      {candidate && (
        <Box className="ty-reveal" bg="bg.card" p={4} borderRadius="xl" shadow="md" mb={5} borderWidth="1px" borderColor="border.soft">
          <Text fontWeight="bold" color="text.heading" fontSize="lg">Thank you, {candidate.name}!</Text>
          <Text fontSize="sm" color="text.muted">
            We've received your payment of {candidate.paymentAmount ? formatINR(candidate.paymentAmount) : 'N/A'}
          </Text>
          <Text fontSize="sm" color="text.muted">Payment ID: {candidate.paymentId || paymentId}</Text>
        </Box>
      )}

      <Stack className="ty-reveal" spacing={4} bg="bg.card" p={{ base: 4, md: 6 }} borderRadius="2xl" shadow="lg" mb={5} borderWidth="1px" borderColor="border.soft">
        <Heading size="md" textAlign="center" color="text.heading">Your Registration is Confirmed!</Heading>
        {event && <InfoRow icon={CalendarDays} title="Event Date">{event.dateLabel}</InfoRow>}
        {event && <InfoRow icon={MapPin} title="Venue">{[event.venue.name, event.venue.address].filter(Boolean).join(', ')}</InfoRow>}
        <InfoRow icon={Phone} title="WhatsApp Updates">You'll receive event updates and group links on WhatsApp</InfoRow>
        <Box p={3} bg="brand.50" _dark={{ bg: 'whiteAlpha.100' }} borderRadius="lg">
          <Text fontWeight="semibold" color="text.heading">Highlights</Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={2} textAlign="center" fontSize="sm">
            {HIGHLIGHTS.map(h => <Text key={h.id} fontWeight="semibold">{h.title}</Text>)}
          </SimpleGrid>
        </Box>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          <Button as={RouterLink} to="/attendance" leftIcon={<QrCode size={18} />} variant="festival">View my QR code</Button>
          {event && <Button onClick={() => downloadEventIcs(event)} leftIcon={<CalendarPlus size={18} />} variant="outline">Add to calendar</Button>}
          {event && <Button as={Link} href={event.venue.mapsUrl} isExternal leftIcon={<Navigation size={18} />} variant="outline" _hover={{ textDecoration: 'none' }}>Get directions</Button>}
          <Button as={Link} href={`https://wa.me/?text=${shareText}`} isExternal leftIcon={<MessageCircle size={18} />} colorScheme="green" variant="outline" _hover={{ textDecoration: 'none' }}>Invite a friend</Button>
        </SimpleGrid>
        <Box textAlign="center" p={4} bg="bg.subtle" borderRadius="lg">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Need Help?</Text>
          <HStack justify="center" spacing={6} fontSize="sm">
            <Link href={`mailto:${EVENT.contact.email}`} color="brand.600" display="flex" alignItems="center" gap={1}>
              <Icon as={Mail} boxSize={4} /> Email Support
            </Link>
            <Link href={`tel:${EVENT.contact.phone}`} color="brand.600" display="flex" alignItems="center" gap={1}>
              <Icon as={Phone} boxSize={4} /> Call Us
            </Link>
          </HStack>
        </Box>
      </Stack>

      <Center className="ty-reveal">
        <Button onClick={() => navigate('/')} variant="ghost" leftIcon={<ArrowLeft size={18} />}>
          Register Another Participant
        </Button>
      </Center>
      <Box className="ty-reveal" textAlign="center" mt={6} p={4} bgGradient="linear(to-r, brand.600, brand.400)" color="white" borderRadius="xl">
        <Text fontWeight="semibold" mb={1}>🙏 Hare Krishna! 🙏</Text>
        <Text fontSize="sm" opacity={0.92}>We're excited for a day with nature & divine!</Text>
      </Box>
    </Container>
  );
}

export default function ThankYouPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, candidate } = usePaymentStatus(id);

  let content;
  if (status === 'loading') {
    content = (
      <Center minH="100vh" role="status" aria-label="Checking payment">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  } else if (status === 'pending') {
    content = (
      <StatusCard color="orange.500" title="Payment Processing" icon={<Spinner size="xl" color="orange.500" thickness="4px" />}>
        <Text>Your payment is being processed. This usually takes 10-20 seconds.</Text>
        <Text fontSize="sm" color="text.muted">Payment ID: {id}</Text>
        <Text fontSize="sm" color="text.muted">Please wait... We're automatically checking your payment status.</Text>
        <Button variant="ghost" onClick={() => navigate('/')}>Register Another Person</Button>
        <Text fontSize="xs" color="text.muted">Need help? Contact support with your payment ID above.</Text>
      </StatusCard>
    );
  } else if (status === 'failed') {
    content = (
      <StatusCard color="red.500" title="Payment Failed" icon={<Icon as={XCircle} boxSize={16} color="red.400" />}>
        <Text>Your payment was not successful. This could be due to payment cancellation, insufficient funds, or a technical issue.</Text>
        {candidate?.paymentFailureReason && (
          <Text fontSize="sm" p={3} bg="bg.subtle" borderRadius="md">Reason: {candidate.paymentFailureReason}</Text>
        )}
        <Text fontSize="sm" color="text.muted">Payment ID: {id}</Text>
        <Button variant="festival" onClick={() => navigate('/')}>Try Registration Again</Button>
        <Button variant="outline" as={Link} href={`mailto:${EVENT.contact.email}`} _hover={{ textDecoration: 'none' }}>Contact Support</Button>
      </StatusCard>
    );
  } else if (status === 'invalid' || status === 'error') {
    const invalid = status === 'invalid';
    content = (
      <StatusCard color={invalid ? 'red.500' : 'orange.500'} title={invalid ? 'Invalid Payment' : 'Server Error'}>
        <Text>
          {invalid
            ? "This payment ID is not valid or doesn't match any registration."
            : 'Something went wrong while verifying your payment. Please try again later.'}
        </Text>
        <Button variant="festival" onClick={() => navigate('/')}>Go Back to Home</Button>
      </StatusCard>
    );
  } else {
    content = <SuccessView candidate={candidate} paymentId={id} />;
  }

  return <PublicShell>{content}</PublicShell>;
}
