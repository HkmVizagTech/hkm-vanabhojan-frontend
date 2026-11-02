import React, { useEffect, useState } from 'react';
import { Box, Button, Container, HStack, Image, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import logo from '../../assets/logo.svg';

const LINKS = [
  { id: 'highlights', label: 'Highlights' },
  { id: 'about', label: 'About' },
  { id: 'how', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
];

const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Fixed top bar: transparent over the hero, frosted glass once the page scrolls. */
export default function SiteHeader({ onRegister }) {
  const { event } = useCurrentEvent();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const registerLabel = event && !event.registrationOpen ? 'Closed' : 'Register';

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={40}
      transition="all .25s ease"
      bg={scrolled ? 'rgba(10,21,17,0.92)' : 'transparent'}
      // Fine brass diagonal hatching: texture without noise.
      bgImage={scrolled ? 'repeating-linear-gradient(135deg, rgba(201,162,74,0.07) 0 1px, transparent 1px 9px)' : 'none'}
      backdropFilter={scrolled ? 'blur(10px)' : 'none'}
      _after={{
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        h: '1px',
        bgGradient: 'linear(to-r, transparent, rgba(201,162,74,0.75) 20%, rgba(201,162,74,0.75) 80%, transparent)',
        opacity: scrolled ? 1 : 0,
        transition: 'opacity .25s ease',
      }}
    >
      <Container maxW="6xl" h={{ base: '60px', md: '68px' }} display="flex" alignItems="center" justifyContent="space-between" gap={4}>
        <HStack as="a" href="/" spacing={3} aria-label="Kartika Vanabhojanam home">
          <Image src={logo} alt="" boxSize={{ base: '36px', md: '42px' }} borderRadius="full" />
          <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: 'lg', md: '2xl' }} color="white" lineHeight="1.05">
            Kartika Vanabhojanam
          </Text>
        </HStack>

        <HStack as="nav" aria-label="Sections" spacing={1} display={{ base: 'none', lg: 'flex' }}>
          {LINKS.map(l => (
            <Link
              key={l.id}
              as="button"
              type="button"
              onClick={() => scrollTo(l.id)}
              px={3}
              py={2}
              borderRadius="lg"
              fontWeight="semibold"
              fontSize="sm"
              color="whiteAlpha.800"
              _hover={{ bg: 'whiteAlpha.200', textDecoration: 'none', color: 'white' }}
            >
              {l.label}
            </Link>
          ))}
        </HStack>

        <HStack spacing={2}>
          <Button as={RouterLink} to="/attendance" size="sm" variant="ghost" color="white" _hover={{ bg: 'whiteAlpha.200' }} leftIcon={<QrCode size={16} />} display={{ base: 'none', sm: 'inline-flex' }}>
            My QR
          </Button>
          <Button size="sm" variant="brass" px={5} onClick={onRegister}>
            {registerLabel}
          </Button>
        </HStack>
      </Container>
    </Box>
  );
}
