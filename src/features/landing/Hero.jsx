import React, { useRef } from 'react';
import { Box, Button, Container, Flex, Heading, HStack, Image, Text, VStack, usePrefersReducedMotion } from '@chakra-ui/react';
import { ArrowDown, CalendarDays, MapPin, QrCode, Sparkles } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { EVENT } from '../../config/event';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { gsap, useGSAP } from '../../lib/gsap';
import { useCountdown } from '../../hooks/useCountdown';
import { formatINR } from '../../utils/format';
import logo from '../../assets/logo.svg';

// Deterministic pseudo-random so the skyline is identical on every render.
const rng = seed => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

function treeLine(seed, count, minH, maxH) {
  const rand = rng(seed);
  const step = 1440 / count;
  let d = '';
  for (let i = 0; i <= count; i++) {
    const x = i * step + (rand() - 0.5) * step * 0.6;
    const h = minH + rand() * (maxH - minH);
    const w = step * (0.45 + rand() * 0.35);
    d += `M${(x - w).toFixed(1)},300 C${(x - w).toFixed(1)},${(300 - h * 0.55).toFixed(1)} ${(x - w * 0.3).toFixed(1)},${(300 - h * 0.85).toFixed(1)} ${x.toFixed(1)},${(300 - h).toFixed(1)} C${(x + w * 0.3).toFixed(1)},${(300 - h * 0.85).toFixed(1)} ${(x + w).toFixed(1)},${(300 - h * 0.55).toFixed(1)} ${(x + w).toFixed(1)},300 Z `;
  }
  return d;
}
const FOREST_BACK = treeLine(11, 17, 110, 220);
const FOREST_FRONT = treeLine(29, 11, 60, 140);
const FIREFLIES = Array.from({ length: 16 }, (_, i) => {
  const r = rng(100 + i);
  return { left: `${6 + r() * 88}%`, top: `${18 + r() * 52}%`, delay: `${(r() * 5).toFixed(1)}s`, size: 2 + Math.round(r() * 2) };
});

/** A quiet forest skyline with a few fireflies: the "vana" in Vanabhojanam, kept minimal. */
function HeroBackdrop() {
  return (
    <>
      <Box aria-hidden="true" position="absolute" left={0} right={0} bottom={0} h={{ base: '150px', md: '240px' }} pointerEvents="none">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" width="100%" height="100%">
          <path d={FOREST_BACK} fill="#10281d" />
          <path d={FOREST_FRONT} fill="#0b1c15" />
          <rect x="0" y="296" width="1440" height="4" fill="#0b1c15" />
        </svg>
      </Box>
      <Box aria-hidden="true" position="absolute" inset={0} pointerEvents="none" overflow="hidden">
        {FIREFLIES.map((f, i) => (
          <Box
            key={i}
            position="absolute"
            left={f.left}
            top={f.top}
            boxSize={`${f.size}px`}
            borderRadius="full"
            bg="#f1d58a"
            boxShadow="0 0 8px 2px rgba(241,213,138,0.55)"
            animation={`firefly 4.5s ease-in-out ${f.delay} infinite`}
          />
        ))}
      </Box>
    </>
  );
}

function Countdown({ dateISO }) {
  const left = useCountdown(`${dateISO}T00:00:00+05:30`);
  if (!left) return null;
  const cells = [
    ['Days', left.days],
    ['Hours', left.hours],
    ['Mins', left.minutes],
    ['Secs', left.seconds],
  ];
  return (
    <HStack className="hero-pill" spacing={2} role="timer" aria-label="Time until the festival">
      {cells.map(([label, n]) => (
        <VStack
          key={label}
          spacing={0}
          minW={{ base: '60px', md: '68px' }}
          py={2.5}
          borderRadius="lg"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <Text fontWeight="semibold" fontSize={{ base: '2xl', md: '3xl' }} lineHeight="1" color="white" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {String(n).padStart(2, '0')}
          </Text>
          <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="whiteAlpha.700">
            {label}
          </Text>
        </VStack>
      ))}
    </HStack>
  );
}

export default function Hero({ onRegister }) {
  const { event } = useCurrentEvent();
  const root = useRef(null);
  const reduced = usePrefersReducedMotion();
  const closed = event && !event.registrationOpen;

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-word', { yPercent: 115, duration: 1, stagger: 0.08 })
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.6')
        .from('.hero-pill', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .from('.hero-cta', { y: 16, opacity: 0, duration: 0.6 }, '-=0.4');
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <Box
      ref={root}
      as="section"
      position="relative"
      overflow="hidden"
      color="white"
      bg="#0a1511"
      bgImage="radial-gradient(ellipse 55% 60% at 50% 40%, rgba(201,162,74,0.16), transparent 70%), radial-gradient(ellipse 80% 50% at 10% 110%, rgba(31,90,61,0.45), transparent 70%)"
      pt={{ base: '110px', md: '150px' }}
      pb={{ base: 28, md: 44 }}
    >
      <HeroBackdrop />
      <Container maxW="6xl" position="relative" zIndex={1}>
        <Flex justify="center">
          <VStack align="center" spacing={{ base: 4, md: 6 }} textAlign="center" maxW="3xl">
            {event ? (
              <HStack
                className="hero-pill"
                spacing={2}
                px={4}
                py={2}
                borderRadius="full"
                bg="whiteAlpha.100"
                borderWidth="1px"
                borderColor="whiteAlpha.300"
                fontSize="sm"
                fontWeight="medium"
                color="whiteAlpha.900"
                flexWrap="wrap"
                justify="center"
              >
                <CalendarDays size={16} />
                <Text>{event.dateLabel}</Text>
                {event.venue.short && (
                  <>
                    <Text opacity={0.4}>·</Text>
                    <MapPin size={16} />
                    <Text>{event.venue.short}</Text>
                  </>
                )}
              </HStack>
            ) : (
              <HStack className="hero-pill" spacing={2} px={4} py={2} borderRadius="full" bg="whiteAlpha.100" fontSize="sm" fontWeight="medium" color="whiteAlpha.900">
                <Sparkles size={16} />
                <Text>Dates for the next Vanabhojanam will be announced soon</Text>
              </HStack>
            )}

            <Heading as="h1" aria-label={`Karthik ${EVENT.name}`} lineHeight="0.95">
              <Box as="span" display="block" overflow="hidden" pb="0.2em">
                <Box as="span" className="hero-word" display="inline-block" fontFamily="heading" fontStyle="italic" fontWeight={500} fontSize={{ base: '2xl', md: '4xl' }} letterSpacing="0.28em" color="saffron.300" textTransform="uppercase" mb={{ base: 1, md: 2 }}>
                  Karthik
                </Box>
              </Box>
              <Box as="span" display="block" overflow="hidden" pb="0.3em" mb="-0.2em">
                <Box
                  as="span"
                  className="hero-word"
                  display="inline-block"
                  fontSize={{ base: '4xl', sm: '6xl', md: '8xl' }}
                  color="transparent"
                  bgImage="linear-gradient(100deg, #ffffff 0%, #ffffff 42%, #f1d58a 50%, #ffffff 58%, #ffffff 100%)"
                  bgSize="250% 100%"
                  bgClip="text"
                  animation="heroSheen 3.2s ease-out 1.1s 1 both"
                  letterSpacing="0.06em"
                  pr="0.05em"
                  pb="0.25em"
                  mb="-0.25em"
                >
                  VANABHOJANAM
                </Box>
              </Box>
            </Heading>

            <Text className="hero-sub" fontSize={{ base: 'lg', md: 'xl' }} fontFamily="heading" fontStyle="italic" color="whiteAlpha.800">
              {EVENT.tagline}
            </Text>
            <Box className="hero-sub" aria-hidden="true" h="1px" w="72px" bg="saffron.400" />
            <Text className="hero-sub" maxW="xl" color="whiteAlpha.800" fontSize={{ base: 'md', md: 'lg' }}>
              A day away from screens: spiritual talks, games, ecstatic kirtan and a shared prasadam feast.
            </Text>

            {event && <Countdown dateISO={event.dateISO} />}

            <HStack className="hero-cta" spacing={3} flexWrap="wrap" justify="center">
              <Button variant="brass" size="lg" px={8} h="56px" fontSize="md" rightIcon={<ArrowDown size={18} />} onClick={onRegister}>
                {closed ? 'Registration closed' : 'Register Now'}
              </Button>
              <Button as={RouterLink} to="/attendance" size="lg" h="56px" variant="outline" color="white" borderColor="whiteAlpha.400" leftIcon={<QrCode size={18} />} _hover={{ bg: 'whiteAlpha.200' }}>
                View my QR
              </Button>
            </HStack>

            {event && (
              <Text className="hero-sub" fontWeight="semibold" color="saffron.200">
                {formatINR(event.fees.College.amount)} students · {formatINR(event.fees.Working.amount)} others
              </Text>
            )}

            <HStack className="hero-sub" spacing={3} pt={1}>
              <Image src={logo} alt="" boxSize="34px" borderRadius="full" />
              <Text fontSize="sm" color="whiteAlpha.700" textAlign="left">
                Organised by <Text as="span" fontWeight="semibold" color="white">{EVENT.organiser}</Text>
              </Text>
            </HStack>
          </VStack>

        </Flex>
      </Container>
    </Box>
  );
}
