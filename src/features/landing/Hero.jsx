import React, { useRef } from 'react';
import { Box, Button, Container, Flex, HStack, Heading, Image, Text, VStack, usePrefersReducedMotion } from '@chakra-ui/react';
import { ArrowDown, CalendarDays, MapPin } from 'lucide-react';
import { EVENT } from '../../config/event';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { gsap, useGSAP } from '../../lib/gsap';
import { useCountdown } from '../../hooks/useCountdown';
import Figure from '../../components/three/Figure';
import Petals from '../../components/common/Petals';
import logo from '../../assets/newLogo.png';

const TITLE_WORDS = ['VANABHOJANAM'];

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
    <HStack spacing={2} className="hero-pill" role="timer" aria-label="Time until the festival">
      {cells.map(([label, n]) => (
        <VStack
          key={label}
          spacing={0}
          minW="58px"
          py={2}
          borderRadius="lg"
          bg="whiteAlpha.800"
          _dark={{ bg: 'whiteAlpha.200' }}
          boxShadow="sm"
        >
          <Text fontFamily="heading" fontWeight="bold" fontSize="2xl" lineHeight="1" color="brand.700" _dark={{ color: 'brand.100' }}>
            {String(n).padStart(2, '0')}
          </Text>
          <Text fontSize="10px" textTransform="uppercase" letterSpacing="wider" color="text.muted">
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

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-logo', { scale: 0.4, opacity: 0, rotate: -25, duration: 1, ease: 'back.out(1.8)' })
        .from('.hero-word', { yPercent: 115, duration: 1, stagger: 0.08 }, '-=0.6')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.5')
        .from('.hero-pill', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .from('.hero-cta', { y: 16, opacity: 0, duration: 0.6 }, '-=0.3');
      gsap.to('.hero-lotus', {
        yPercent: -14,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-glow', { scale: 1.12, opacity: 0.85, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <Box ref={root} as="section" position="relative" overflow="hidden" pt={{ base: 6, md: 12 }} pb={{ base: 10, md: 20 }}>
      <Box
        className="hero-glow"
        aria-hidden="true"
        position="absolute"
        top={{ base: '8%', md: '-10%' }}
        right={{ base: '-30%', md: '-5%' }}
        boxSize={{ base: '420px', md: '680px' }}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(246,171,46,0.55) 0%, rgba(238,117,155,0.25) 45%, transparent 70%)"
        opacity={0.65}
        pointerEvents="none"
      />
      <Petals />
      <Container maxW="6xl" position="relative" zIndex={1}>
        <Flex direction={{ base: 'column-reverse', md: 'row' }} align="center" gap={{ base: 2, md: 8 }}>
          <VStack flex="1.05" align={{ base: 'center', md: 'flex-start' }} spacing={5} textAlign={{ base: 'center', md: 'left' }}>
            <HStack spacing={4}>
              <Image
                className="hero-logo"
                src={logo}
                alt="Hare Krishna Movement logo"
                boxSize={{ base: '72px', md: '92px' }}
                borderRadius="full"
                borderWidth="3px"
                borderColor="brand.600"
                bg="white"
                objectFit="cover"
                boxShadow="0 8px 24px -8px rgba(32,96,61,0.5)"
              />
              <Text className="hero-sub" fontWeight="bold" fontSize="sm" color="lotus.500" textAlign="left" maxW="220px" lineHeight="1.3">
                Organised by {EVENT.organiser}
              </Text>
            </HStack>

            <Heading as="h1" aria-label={`${EVENT.name} Youth Festival`} lineHeight="0.95">
              {TITLE_WORDS.map(w => (
                <Box key={w} as="span" display="block" overflow="hidden" pb="0.08em">
                  <Box
                    as="span"
                    className="hero-word"
                    display="inline-block"
                    fontSize={{ base: '4xl', sm: '6xl', md: '7xl' }}
                    bgGradient="linear(to-r, brand.700, brand.500 55%, saffron.500)"
                    bgClip="text"
                    color="transparent"
                    _dark={{ bgGradient: 'linear(to-r, brand.100, brand.300 55%, saffron.300)' }}
                    letterSpacing="0.02em"
                    pr="0.05em"
                  >
                    {w}
                  </Box>
                </Box>
              ))}
              <Box as="span" display="block" overflow="hidden">
                <Box
                  as="span"
                  className="hero-word"
                  display="inline-block"
                  fontSize={{ base: '2xl', md: '4xl' }}
                  color="saffron.600"
                  fontStyle="italic"
                >
                  Youth Festival
                </Box>
              </Box>
            </Heading>

            <Text className="hero-sub" fontSize={{ base: 'lg', md: 'xl' }} fontFamily="heading" fontStyle="italic" color="text.muted">
              {EVENT.tagline}
            </Text>

            {event ? (
              <>
                <HStack className="hero-pill" spacing={4} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }} color="brand.700" _dark={{ color: 'brand.100' }} fontWeight="bold" fontSize="sm">
                  <HStack><CalendarDays size={18} /><Text>{event.dateLabel}</Text></HStack>
                  {event.venue.short && <HStack><MapPin size={18} /><Text>{event.venue.short}</Text></HStack>}
                </HStack>
                <Countdown dateISO={event.dateISO} />
              </>
            ) : (
              <Text className="hero-pill" fontWeight="bold" color="brand.700" _dark={{ color: 'brand.100' }}>
                Dates for the next Vanabhojanam will be announced soon.
              </Text>
            )}

            {/* GSAP animates the wrapper: the button's own CSS transition would fight the tween. */}
            <Box className="hero-cta">
              <Button variant="festival" size="lg" px={8} rightIcon={<ArrowDown size={18} />} onClick={onRegister}>
                {event && !event.registrationOpen ? 'Registration closed' : 'Register Now'}
              </Button>
            </Box>
          </VStack>

          <Box className="hero-lotus" flex="1" w="100%" maxW={{ base: '420px', md: 'none' }}>
            <Figure name="lotus" label="A blooming lotus on still water" softEdges h={{ base: '280px', md: '520px' }} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
