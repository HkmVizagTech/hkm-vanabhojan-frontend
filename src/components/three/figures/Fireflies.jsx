import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { C } from '../palette';
import { useFigure } from '../figureContext';

/** Soft drifting lights (diyas / fireflies). Cheap: one draw call. */
export default function Fireflies({ count = 90, spread = [7, 3.2, 4] }) {
  const { reducedMotion } = useFigure();
  const ref = useRef();
  const { positions, seeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * spread[0];
      p[i * 3 + 1] = Math.random() * spread[1] - 0.4;
      p[i * 3 + 2] = (Math.random() - 0.5) * spread[2] - 0.5;
      s[i] = Math.random() * Math.PI * 2;
    }
    return { positions: p, seeds: s };
  }, [count, spread]);

  useFrame((state, delta) => {
    if (reducedMotion || !ref.current) return;
    const attr = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      attr.array[i * 3 + 1] += delta * 0.12;
      attr.array[i * 3] += Math.sin(t * 0.6 + seeds[i]) * delta * 0.1;
      if (attr.array[i * 3 + 1] > spread[1] - 0.4) attr.array[i * 3 + 1] = -0.4;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={C.gold} size={0.07} transparent opacity={0.85} depthWrite={false} sizeAttenuation />
    </points>
  );
}
