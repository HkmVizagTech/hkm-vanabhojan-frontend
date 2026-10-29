import React, { useMemo, useRef } from 'react';
import { Vector2 } from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const PLATE = [[0, 0], [1.2, 0], [1.38, 0.04], [1.48, 0.16]];
const BOWL = [[0, 0], [0.22, 0], [0.34, 0.12], [0.36, 0.2]];
const toVec = pts => pts.map(([x, y]) => new Vector2(x, y));

const BOWLS = [
  { color: C.saffron }, // sweet
  { color: '#8a5a2b' }, // dal
  { color: C.leaf }, // sabji
  { color: C.cream }, // curd
  { color: C.lotusDeep }, // chutney
];

export default function Thali() {
  const { reducedMotion, activeRef } = useFigure();
  const root = useRef();
  const steam = useRef([]);
  const plate = useMemo(() => toVec(PLATE), []);
  const bowl = useMemo(() => toVec(BOWL), []);

  useGSAP(() => {
    if (reducedMotion) return;
    steam.current.forEach((mesh, i) => {
      if (!mesh) return;
      gsap.fromTo(
        mesh.position,
        { y: 0.35 },
        { y: 1.5, duration: 2.4, repeat: -1, ease: 'sine.out', delay: i * 0.8 }
      );
      gsap.fromTo(
        mesh.material,
        { opacity: 0.5 },
        { opacity: 0, duration: 2.4, repeat: -1, ease: 'sine.in', delay: i * 0.8 }
      );
      gsap.fromTo(
        mesh.scale,
        { x: 0.6, y: 0.6, z: 0.6 },
        { x: 1.7, y: 1.7, z: 1.7, duration: 2.4, repeat: -1, ease: 'none', delay: i * 0.8 }
      );
    });
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    root.current.rotation.y += delta * (activeRef.current ? 1.4 : 0.35);
    root.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
  });

  return (
    <group ref={root} rotation={[0.55, 0, 0]} position={[0, -0.25, 0]} scale={0.85}>
      <mesh>
        <latheGeometry args={[plate, 40]} />
        <Mat color={C.steel} flat={false} metal={0.25} rough={0.35} side={2} />
      </mesh>
      {BOWLS.map((b, i) => {
        const a = (i / BOWLS.length) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.92, 0.03, Math.sin(a) * 0.92]}>
            <mesh>
              <latheGeometry args={[bowl, 20]} />
              <Mat color={C.steel} flat={false} metal={0.25} rough={0.35} side={2} />
            </mesh>
            <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.3, 18]} />
              <Mat color={b.color} flat={false} />
            </mesh>
          </group>
        );
      })}
      {/* rice mound + puris */}
      <mesh position={[0, 0.14, 0]} scale={[0.5, 0.3, 0.5]}>
        <sphereGeometry args={[1, 12, 8]} />
        <Mat color={C.white} flat={false} />
      </mesh>
      {[0.3, -0.45].map((x, i) => (
        <mesh key={x} position={[x, 0.07 + i * 0.03, 0.15 - i * 0.3]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.24, 14, 8]} />
          <Mat color={C.gold} flat={false} />
        </mesh>
      ))}
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => (steam.current[i] = el)} position={[(i - 1) * 0.28, 0.35, 0]}>
          <sphereGeometry args={[0.13, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
