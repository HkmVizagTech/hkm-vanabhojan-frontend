import React, { useRef } from 'react';
import { Box, usePrefersReducedMotion } from '@chakra-ui/react';
import { gsap, useGSAP } from '../../lib/gsap';

/** Card that leans toward the pointer (mouse devices only). */
export default function TiltCard({ children, max = 9, ...boxProps }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (reduced || !el || !window.matchMedia('(hover: hover)').matches) return undefined;
      gsap.set(el, { transformPerspective: 800 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
      const lift = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      const move = e => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 2 * max);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 2 * max);
        lift(-6);
      };
      const leave = () => {
        rx(0);
        ry(0);
        lift(0);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    },
    { scope: ref, dependencies: [reduced, max] }
  );

  return (
    <Box ref={ref} willChange="transform" {...boxProps}>
      {children}
    </Box>
  );
}
