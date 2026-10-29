import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const RINGS = [
  { n: 8, len: 1.55, width: 0.42, open: 0.22, color: C.lotusPale, offset: 0 },
  { n: 8, len: 1.3, width: 0.4, open: 0.55, color: C.lotus, offset: Math.PI / 8 },
  { n: 6, len: 1.0, width: 0.36, open: 0.92, color: C.lotus, offset: 0.2 },
  { n: 5, len: 0.7, width: 0.3, open: 1.25, color: C.lotusDeep, offset: 0.5 },
];
const CLOSED = 1.45;

function Petal({ angle, ring, tiltRef }) {
  return (
    <group rotation={[0, angle, 0]}>
      <group ref={tiltRef} rotation={[-CLOSED, 0, 0]}>
        <mesh position={[0, 0, ring.len / 2]} scale={[ring.width, 0.07, ring.len / 2]}>
          <sphereGeometry args={[1, 6, 4]} />
          <Mat color={ring.color} />
        </mesh>
      </group>
    </group>
  );
}

function LilyPad({ position, radius, rotation }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <cylinderGeometry args={[radius, radius, 0.05, 14, 1, false, 0.5, Math.PI * 1.85]} />
      <Mat color={C.leaf} />
    </mesh>
  );
}

export default function Lotus() {
  const { reducedMotion } = useFigure();
  const root = useRef();
  const tilts = useRef([]); // [ringIndex][petalIndex] -> group
  const ripples = useRef([]);

  const petals = useMemo(
    () =>
      RINGS.map((ring, r) =>
        Array.from({ length: ring.n }, (_, i) => ({ key: `${r}-${i}`, angle: ring.offset + (i / ring.n) * Math.PI * 2 }))
      ),
    []
  );
  const stamens = useMemo(
    () => Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2),
    []
  );

  useGSAP(() => {
    RINGS.forEach((ring, r) => {
      const groups = tilts.current[r].filter(Boolean);
      if (reducedMotion) {
        groups.forEach(g => (g.rotation.x = -ring.open));
        return;
      }
      gsap.to(
        groups.map(g => g.rotation),
        { x: -ring.open, duration: 1.6, ease: 'power3.out', stagger: 0.05, delay: 0.25 + (RINGS.length - 1 - r) * 0.18 }
      );
    });
    if (!reducedMotion) {
      ripples.current.forEach((mesh, i) => {
        if (!mesh) return;
        gsap.fromTo(
          mesh.scale,
          { x: 1, y: 1, z: 1 },
          { x: 2.6, y: 2.6, z: 2.6, duration: 4.5, repeat: -1, ease: 'sine.out', delay: i * 1.5 }
        );
        gsap.fromTo(
          mesh.material,
          { opacity: 0.55 },
          { opacity: 0, duration: 4.5, repeat: -1, ease: 'sine.out', delay: i * 1.5 }
        );
      });
    }
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion || !root.current) return;
    root.current.rotation.y += delta * 0.12;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
  });

  return (
    <group rotation={[0.1, 0, 0]} position={[0, -0.25, 0]}>
      {/* water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <circleGeometry args={[3.6, 48]} />
        <Mat color={C.water} flat={false} transparent opacity={0.35} />
      </mesh>
      {[0, 1, 2].map(i => (
        <mesh
          key={i}
          ref={el => (ripples.current[i] = el)}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
        >
          <ringGeometry args={[0.96, 1, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
      <LilyPad position={[-2.1, -0.08, 0.7]} radius={0.62} rotation={0.4} />
      <LilyPad position={[2.0, -0.08, 0.9]} radius={0.5} rotation={2.2} />
      <LilyPad position={[1.3, -0.08, -1.7]} radius={0.55} rotation={4.1} />

      <group ref={root}>
        {RINGS.map((ring, r) => (
          <group key={r} position={[0, r * 0.012, 0]}>
            {petals[r].map((p, i) => (
              <Petal
                key={p.key}
                angle={p.angle}
                ring={ring}
                tiltRef={el => {
                  (tilts.current[r] ||= [])[i] = el;
                }}
              />
            ))}
          </group>
        ))}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.16, 8]} />
          <Mat color={C.gold} />
        </mesh>
        {stamens.map(a => (
          <mesh key={a} position={[Math.cos(a) * 0.3, 0.28, Math.sin(a) * 0.3]}>
            <sphereGeometry args={[0.05, 6, 5]} />
            <Mat color={C.saffron} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
