import React, { useMemo, useRef } from 'react';
import { BufferAttribute, Color, DoubleSide, PlaneGeometry } from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const RINGS = [
  { n: 9, len: 1.7, width: 0.4, open: 0.16, color: C.lotus, offset: 0 },
  { n: 9, len: 1.5, width: 0.4, open: 0.5, color: C.lotus, offset: Math.PI / 9 },
  { n: 7, len: 1.2, width: 0.38, open: 0.9, color: C.lotusDeep, offset: 0.2 },
  { n: 5, len: 0.8, width: 0.32, open: 1.3, color: C.lotusDeep, offset: 0.5 },
];
const CLOSED = 1.45;

/** A real petal: pointed, cupped across its width, curling back at the tip, tinted from a deeper base to a pale tip. */
export function buildPetal(ring) {
  const geo = new PlaneGeometry(1, 1, 10, 18);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const base = new Color(ring.color).lerp(new Color('#a85f6e'), 0.25);
  const tip = new Color(ring.color).lerp(new Color('#ffffff'), 0.3);
  const tmp = new Color();
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getY(i) + 0.5; // 0 at the base, 1 at the tip
    const v = pos.getX(i) * 2; // -1..1 across
    const half = ring.width * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85);
    const x = v * half;
    const y = 0.22 * ring.width * v * v * (1 - 0.5 * u) - 0.35 * Math.pow(u, 3) * ring.len * 0.35; // cup, then tip curl
    pos.setXYZ(i, x, y, u * ring.len);
    tmp.copy(base).lerp(tip, Math.pow(u, 1.3));
    colors.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function Petal({ angle, geo, tiltRef }) {
  return (
    <group rotation={[0, angle, 0]}>
      <group ref={tiltRef} rotation={[-CLOSED, 0, 0]}>
        <mesh geometry={geo} castShadow>
          <meshPhysicalMaterial vertexColors side={DoubleSide} roughness={0.55} sheen={0.8} sheenRoughness={0.5} sheenColor="#ffffff" clearcoat={0.15} />
        </mesh>
      </group>
    </group>
  );
}

function LilyPad({ position, radius, rotation }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <cylinderGeometry args={[radius, radius, 0.05, 40, 1, false, 0.5, Math.PI * 1.85]} />
      <Mat color={C.leaf} />
    </mesh>
  );
}

export default function Lotus() {
  const { reducedMotion } = useFigure();
  const root = useRef();
  const tilts = useRef([]); // [ringIndex][petalIndex] -> group
  const ripples = useRef([]);

  const geos = useMemo(() => RINGS.map(buildPetal), []);
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
    root.current.rotation.y += delta * 0.07;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
  });

  return (
    <group rotation={[0.1, 0, 0]} position={[0, -0.25, 0]}>
      {/* water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <circleGeometry args={[3.0, 64]} />
        <Mat color={C.water} transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, 0]} receiveShadow>
        <circleGeometry args={[3.6, 48]} />
        <shadowMaterial opacity={0.22} />
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
      <LilyPad position={[-1.7, -0.08, 0.5]} radius={0.5} rotation={0.4} />
      <LilyPad position={[1.6, -0.08, 0.8]} radius={0.42} rotation={2.2} />
      <LilyPad position={[1.1, -0.08, -1.4]} radius={0.45} rotation={4.1} />

      <group ref={root}>
        {RINGS.map((ring, r) => (
          <group key={r} position={[0, r * 0.012, 0]}>
            {petals[r].map((p, i) => (
              <Petal
                key={p.key}
                angle={p.angle}
                geo={geos[r]}
                tiltRef={el => {
                  (tilts.current[r] ||= [])[i] = el;
                }}
              />
            ))}
          </group>
        ))}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.16, 40]} />
          <Mat color={C.gold} />
        </mesh>
        {stamens.map(a => (
          <mesh key={a} position={[Math.cos(a) * 0.3, 0.28, Math.sin(a) * 0.3]}>
            <sphereGeometry args={[0.05, 32, 20]} />
            <Mat color={C.saffron} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
