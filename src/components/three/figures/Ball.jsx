import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const WEDGES = [C.lotusDeep, C.gold, C.leaf, C.white, C.lotus, C.shyam];
const PHI = (Math.PI * 2) / WEDGES.length;

export default function Ball() {
  const { reducedMotion, activeRef } = useFigure();
  const ball = useRef();
  const squash = useRef();
  const shadow = useRef();

  useGSAP(() => {
    if (reducedMotion) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(ball.current.position, { y: 0.95, duration: 0.55, ease: 'power2.out' })
      .to(ball.current.position, { y: 0, duration: 0.55, ease: 'power2.in' })
      .to(squash.current.scale, { x: 1.18, y: 0.78, z: 1.18, duration: 0.09, ease: 'power1.out' })
      .to(squash.current.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'elastic.out(1,0.4)' });
    gsap.to(shadow.current.scale, {
      x: 0.6, z: 0.6, y: 0.6, duration: 0.55, repeat: -1, yoyo: true, ease: 'power2.out',
    });
  }, [reducedMotion]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    ball.current.rotation.y += delta * (activeRef.current ? 4 : 1.4);
  });

  return (
    <group position={[0, -0.6, 0]}>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <group ref={ball} position={[0, 0, 0]}>
        <group ref={squash} position={[0, 0.78, 0]}>
          <group rotation={[0.3, 0, 0.25]}>
            {WEDGES.map((color, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.78, 16, 12, i * PHI, PHI]} />
                <Mat color={color} flat={false} side={2} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
