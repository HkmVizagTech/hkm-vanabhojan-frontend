import React, { useEffect, useState } from 'react';
import { Box, Button } from '@chakra-ui/react';

/** Mobile-only "Register" bar that hides while the form itself is on screen. */
export default function StickyCta({ targetId, onClick }) {
  const [formVisible, setFormVisible] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const show = pastHero && !formVisible;
  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={30}
      px={3}
      pt={3}
      pb="calc(12px + env(safe-area-inset-bottom))"
      bg="bg.card"
      boxShadow="0 -8px 24px -12px rgba(0,0,0,0.3)"
      transform={show ? 'translateY(0)' : 'translateY(110%)'}
      transition="transform .3s ease"
      aria-hidden={!show}
    >
      <Button variant="festival" w="full" onClick={onClick} tabIndex={show ? 0 : -1}>
        Register Now
      </Button>
    </Box>
  );
}
