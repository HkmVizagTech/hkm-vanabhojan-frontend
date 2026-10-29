import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap, useGSAP } from '../../../lib/gsap';
import { C } from '../palette';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const FRIENDS = [
  { shirt: '#f08a24', skin: C.skin },
  { shirt: '#e44d82', skin: C.skinDark },
  { shirt: '#58ac77', skin: C.skin },
  { shirt: '#4a90d9', skin: C.skinDark },
  { shirt: '#f6c445', skin: C.skin },
  { shirt: '#8e5bd1', skin: C.skinDark },
];

/** A seated cowherd friend. Local +z faces the centre of the circle. */
function Friend({ shirt, skin, innerRef }) {
  return (
    <group ref={innerRef}>
      <mesh position={[0, 0.1, 0]} scale={[0.3, 0.13, 0.26]}>
        <sphereGeometry args={[1, 8, 6]} />
        <Mat color={C.white} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <capsuleGeometry args={[0.15, 0.24, 3, 8]} />
        <Mat color={shirt} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.15, 12, 10]} />
        <Mat color={skin} flat={false} />
      </mesh>
      <mesh position={[0, 0.7, -0.01]} rotation={[-0.15, 0, 0]}>
        <sphereGeometry args={[0.155, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={C.ink} />
      </mesh>
      <mesh position={[0.1, 0.5, 0.14]} rotation={[0.9, 0, -0.3]}>
        <capsuleGeometry args={[0.04, 0.16, 2, 6]} />
        <Mat color={skin} flat={false} />
      </mesh>
      <mesh position={[-0.1, 0.5, 0.14]} rotation={[0.9, 0, 0.3]}>
        <capsuleGeometry args={[0.04, 0.16, 2, 6]} />
        <Mat color={skin} flat={false} />
      </mesh>
    </group>
  );
}

function Krishna({ innerRef }) {
  return (
    <group ref={innerRef} scale={1.15}>
      <mesh position={[0, 0.1, 0]} scale={[0.34, 0.14, 0.28]}>
        <sphereGeometry args={[1, 8, 6]} />
        <Mat color={C.gold} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <capsuleGeometry args={[0.15, 0.26, 3, 8]} />
        <Mat color={C.shyam} flat={false} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.025, 6, 14]} />
        <Mat color={C.white} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.16, 14, 12]} />
        <Mat color={C.shyam} flat={false} />
      </mesh>
      <mesh position={[0, 0.74, -0.015]} rotation={[-0.15, 0, 0]}>
        <sphereGeometry args={[0.165, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={C.ink} />
      </mesh>
      <mesh position={[0, 0.83, 0.02]}>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 10]} />
        <Mat color={C.gold} metal={0.2} />
      </mesh>
      {/* peacock feather */}
      <group position={[0.03, 0.87, 0.02]} rotation={[0, 0, -0.35]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.34, 5]} />
          <Mat color={C.leafDark} />
        </mesh>
        <mesh position={[0, 0.36, 0]} scale={[0.07, 0.12, 0.02]}>
          <sphereGeometry args={[1, 10, 8]} />
          <Mat color="#1aa6a0" flat={false} />
        </mesh>
        <mesh position={[0, 0.37, 0.018]} scale={[0.035, 0.06, 0.01]}>
          <sphereGeometry args={[1, 8, 6]} />
          <Mat color={C.navy} flat={false} />
        </mesh>
        <mesh position={[0, 0.375, 0.026]} scale={[0.015, 0.025, 0.01]}>
          <sphereGeometry args={[1, 6, 5]} />
          <Mat color={C.gold} flat={false} />
        </mesh>
      </group>
      {/* flute */}
      <mesh position={[0.04, 0.66, 0.2]} rotation={[0.1, 0, Math.PI / 2 - 0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
        <Mat color={C.gold} metal={0.2} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1, phase = 0 }) {
  const ref = useRef();
  const { reducedMotion } = useFigure();
  useFrame(state => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + phase) * 0.025;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 1, 7]} />
        <Mat color={C.bark} />
      </mesh>
      <group ref={ref} position={[0, 1, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <icosahedronGeometry args={[0.55, 0]} />
          <Mat color={C.leaf} />
        </mesh>
        <mesh position={[0.28, 0.65, 0.1]}>
          <icosahedronGeometry args={[0.4, 0]} />
          <Mat color="#3aa066" />
        </mesh>
        <mesh position={[-0.22, 0.78, -0.05]}>
          <icosahedronGeometry args={[0.34, 0]} />
          <Mat color="#58ac77" />
        </mesh>
      </group>
    </group>
  );
}

export default function Picnic() {
  const { reducedMotion } = useFigure();
  const root = useRef();
  const heads = useRef([]);
  const friends = useRef([]);
  const krishna = useRef();

  const seats = useMemo(
    () =>
      FRIENDS.map((f, i) => {
        const a = (i / FRIENDS.length) * Math.PI * 2 + 0.3;
        return { ...f, a, x: Math.sin(a) * 1.15, z: Math.cos(a) * 1.15 };
      }),
    []
  );
  const food = useMemo(
    () => [
      [0.45, 0.2, C.saffron], [-0.5, 0.1, C.white], [0.1, -0.55, C.leaf],
      [-0.25, 0.5, C.gold], [0.6, -0.3, C.lotusDeep], [-0.55, -0.35, C.cream],
    ],
    []
  );

  useGSAP(() => {
    const nodes = [krishna.current, ...friends.current].filter(Boolean);
    if (reducedMotion) return;
    gsap.from(nodes.map(n => n.scale), {
      x: 0, y: 0, z: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12, delay: 0.2,
    });
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    const target = state.pointer.x * 0.5 + Math.sin(t * 0.15) * 0.15;
    root.current.rotation.y += (target - root.current.rotation.y) * Math.min(1, delta * 2);
    heads.current.forEach((n, i) => n && (n.position.y = Math.sin(t * 1.4 + i) * 0.015));
  });

  return (
    <group ref={root} position={[0, -0.7, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.9, 40]} />
        <Mat color={C.grass} flat={false} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.03, 28]} />
        <Mat color={C.saffron} />
      </mesh>
      {food.map(([x, z, color], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <sphereGeometry args={[0.09, 8, 6]} />
          <Mat color={color} flat={false} />
        </mesh>
      ))}
      <group ref={el => (heads.current[0] = el)}>
        <group position={[0, 0.03, 0]}>
          <Krishna innerRef={krishna} />
        </group>
      </group>
      {seats.map((s, i) => (
        <group key={i} position={[s.x, 0.03, s.z]} rotation={[0, s.a + Math.PI, 0]}>
          <group ref={el => (heads.current[i + 1] = el)}>
            <Friend shirt={s.shirt} skin={s.skin} innerRef={el => (friends.current[i] = el)} />
          </group>
        </group>
      ))}
      <Tree position={[-2.3, 0, -1.4]} scale={1.15} />
      <Tree position={[2.4, 0, -1.2]} scale={0.95} phase={1.7} />
      <Tree position={[0.4, 0, -2.6]} scale={1.3} phase={3.1} />
    </group>
  );
}
