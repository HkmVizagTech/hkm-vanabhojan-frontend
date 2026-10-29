import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const LINES = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45];

function Half({ side, pivotRef }) {
  return (
    <group ref={pivotRef}>
      <group position={[side * 0.58, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.16, 0.07, 1.6]} />
          <Mat color={C.leafDark} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.04, 0.14, 1.46]} />
          <Mat color={C.cream} />
        </mesh>
        {LINES.map(z => (
          <mesh key={z} position={[0, 0.176, z * 2.4]}>
            <boxGeometry args={[0.78, 0.004, 0.025]} />
            <Mat color="#c9b68f" flat={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Book() {
  const { reducedMotion, activeRef } = useFigure();
  const root = useRef();
  const right = useRef();
  const left = useRef();
  const spark = useRef();

  useGSAP(() => {
    left.current.rotation.z = -0.1;
    if (reducedMotion) {
      right.current.rotation.z = 0.1;
      return;
    }
    right.current.rotation.z = Math.PI - 0.02;
    gsap.to(right.current.rotation, { z: 0.1, duration: 1.4, ease: 'power3.out', delay: 0.2 });
    gsap.from(spark.current.position, { y: 0.2, duration: 1.2, ease: 'back.out(2)', delay: 1.0 });
    gsap.from(spark.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'back.out(3)', delay: 1.0 });
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    root.current.position.y = Math.sin(t * 1.1) * 0.05;
    root.current.rotation.y += delta * (activeRef.current ? 0.9 : 0.25);
    spark.current.rotation.y += delta * 1.6;
    spark.current.position.y = 1.15 + Math.sin(t * 2) * 0.08;
  });

  return (
    <group ref={root} rotation={[0.75, -0.5, 0]} position={[0, -0.2, 0]}>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.1, 0.1, 1.6]} />
        <Mat color={C.saffron} />
      </mesh>
      <Half side={-1} pivotRef={left} />
      <Half side={1} pivotRef={right} />
      <mesh ref={spark} position={[0, 1.15, 0]}>
        <octahedronGeometry args={[0.2]} />
        <Mat color={C.gold} emissive={C.gold} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
