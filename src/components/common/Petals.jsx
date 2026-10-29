import React, { useMemo, useRef } from 'react';
import { Box, usePrefersReducedMotion } from '@chakra-ui/react';
import { gsap, useGSAP } from '../../lib/gsap';

/** Lotus petals drifting down the hero. Purely decorative, GPU transforms only. */
export default function Petals({ count = 14 }) {
  const root = useRef(null);
  const reduced = usePrefersReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 18,
        hue: Math.random() > 0.5 ? '#f49cb7' : '#ffd48a',
      })),
    [count]
  );

  useGSAP(
    () => {
      if (reduced) return;
      const height = root.current.offsetHeight;
      gsap.utils.toArray('.petal').forEach(el => {
        gsap.set(el, { y: -60, rotation: gsap.utils.random(0, 360) });
        gsap.to(el, {
          y: height + 60,
          duration: gsap.utils.random(9, 17),
          delay: gsap.utils.random(0, 12),
          ease: 'none',
          repeat: -1,
        });
        gsap.to(el, {
          x: gsap.utils.random(-70, 70),
          rotation: '+=200',
          duration: gsap.utils.random(3, 5),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      });
    },
    { scope: root, dependencies: [reduced] }
  );

  if (reduced) return null;
  return (
    <Box ref={root} aria-hidden="true" position="absolute" inset={0} overflow="hidden" pointerEvents="none" zIndex={0}>
      {petals.map(p => (
        <Box key={p.id} className="petal" position="absolute" top={0} left={`${p.left}%`} opacity={0.75}>
          <svg width={p.size} height={p.size * 1.4} viewBox="0 0 24 34">
            <path d="M12 0 C22 9 22 24 12 34 C2 24 2 9 12 0Z" fill={p.hue} />
          </svg>
        </Box>
      ))}
    </Box>
  );
}
