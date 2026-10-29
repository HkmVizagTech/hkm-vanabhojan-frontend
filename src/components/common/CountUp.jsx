import React, { useRef } from 'react';
import { usePrefersReducedMotion } from '@chakra-ui/react';
import { gsap, useGSAP } from '../../lib/gsap';

/** Animates a number from its previous value to `value`. */
export default function CountUp({ value, format = n => Math.round(n).toLocaleString('en-IN') }) {
  const ref = useRef(null);
  const last = useRef(0);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (reduced) {
        node.textContent = format(value);
        return;
      }
      const counter = { n: last.current };
      gsap.to(counter, {
        n: value,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => {
          node.textContent = format(counter.n);
        },
        onComplete: () => {
          last.current = value;
        },
      });
    },
    { dependencies: [value, reduced] }
  );

  return <span ref={ref}>{format(last.current)}</span>;
}
