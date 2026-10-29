import React, { useRef } from 'react';
import { Box, usePrefersReducedMotion } from '@chakra-ui/react';
import { gsap, useGSAP } from '../../lib/gsap';

/**
 * Fades + lifts its children into view on scroll. With `stagger`, the items animate one by one:
 * the items are the children, or the grandchildren when Reveal wraps a single grid/stack.
 * Content stays visible when motion is reduced or JS animation can't run.
 */
export default function Reveal({ children, y = 28, stagger = 0, delay = 0, as, ...boxProps }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const host = ref.current.children.length === 1 ? ref.current.firstElementChild : ref.current;
      const targets = stagger ? host.children : ref.current;
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <Box ref={ref} as={as} {...boxProps}>
      {children}
    </Box>
  );
}
