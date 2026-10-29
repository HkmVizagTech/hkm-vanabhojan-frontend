import React, { useMemo, useRef } from 'react';
import { Vector2 } from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

// radius (x) along the drum axis (y): small head, bulging belly, larger head
const PROFILE = [
  [0.2, -1.05], [0.3, -0.9], [0.42, -0.6], [0.52, -0.25], [0.52, 0.1],
  [0.44, 0.5], [0.33, 0.8], [0.29, 1.05],
];

export default function Mridanga() {
  const { reducedMotion, activeRef } = useFigure();
  const root = useRef();
  const pulses = useRef([]);
  const points = useMemo(() => PROFILE.map(([x, y]) => new Vector2(x, y)), []);

  useGSAP(() => {
    if (reducedMotion) return;
    pulses.current.forEach((mesh, i) => {
      if (!mesh) return;
      gsap.fromTo(
        mesh.scale,
        { x: 1, y: 1, z: 1 },
        { x: 1.7, y: 1.7, z: 1.7, duration: 1.6, repeat: -1, ease: 'power2.out', delay: i * 0.53 }
      );
      gsap.fromTo(
        mesh.material,
        { opacity: 0.7 },
        { opacity: 0, duration: 1.6, repeat: -1, ease: 'power2.out', delay: i * 0.53 }
      );
    });
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    root.current.rotation.y += delta * (activeRef.current ? 1.8 : 0.5);
    root.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.05;
  });

  return (
    <group ref={root}>
      <group rotation={[0.35, 0, Math.PI / 2.4]}>
        <mesh>
          <latheGeometry args={[points, 28]} />
          <Mat color={C.clay} flat={false} rough={0.6} />
        </mesh>
        {/* drum heads */}
        <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 24]} />
          <Mat color={C.cream} flat={false} side={2} />
        </mesh>
        <mesh position={[0, -1.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.1, 20]} />
          <Mat color={C.ink} flat={false} side={2} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.29, 24]} />
          <Mat color={C.cream} flat={false} side={2} />
        </mesh>
        <mesh position={[0, 1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.13, 20]} />
          <Mat color={C.ink} flat={false} side={2} />
        </mesh>
        {/* cloth bands */}
        <mesh position={[0, -0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.47, 0.045, 8, 28]} />
          <Mat color={C.lotusDeep} flat={false} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.47, 0.045, 8, 28]} />
          <Mat color={C.gold} flat={false} />
        </mesh>
      </group>
      {/* kirtan pulse rings */}
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => (pulses.current[i] = el)} position={[0, 0, -0.9]}>
          <ringGeometry args={[0.78, 0.82, 40]} />
          <meshBasicMaterial color={C.gold} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
