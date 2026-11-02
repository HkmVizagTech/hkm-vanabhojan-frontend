import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mat } from '../Mat';
import { useFigure } from '../figureContext';

const N = 9;

/** Deterministic QR-like pattern: three finder squares plus pseudo-random modules. */
function buildCells() {
  const cells = [];
  const inFinder = (x, y) => [[0, 0], [N - 3, 0], [0, N - 3]].some(([fx, fy]) => x >= fx && x < fx + 3 && y >= fy && y < fy + 3);
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) {
        const fx = x % 3, fy = y % 3;
        if (!(fx === 1 && fy === 1) || true) cells.push([x, y]);
        continue;
      }
      if (rnd() > 0.52) cells.push([x, y]);
    }
  return cells;
}

/** The QR entry pass every registrant receives, as a small brass-edged card. */
export default function Pass() {
  const { reducedMotion } = useFigure();
  const root = useRef();
  const cells = useMemo(buildCells, []);
  const size = 1.1;
  const step = size / N;

  useFrame((state, delta) => {
    if (reducedMotion || !root.current) return;
    const t = state.clock.elapsedTime;
    const ty = Math.sin(t * 0.6) * 0.45 + state.pointer.x * 0.35;
    const tx = -0.12 + state.pointer.y * -0.2;
    root.current.rotation.y += (ty - root.current.rotation.y) * Math.min(1, delta * 3);
    root.current.rotation.x += (tx - root.current.rotation.x) * Math.min(1, delta * 3);
    root.current.position.y = Math.sin(t * 0.9) * 0.06;
  });

  return (
    <group ref={root}>
      <mesh>
        <boxGeometry args={[1.6, 2.2, 0.07]} />
        <Mat color="#f6efdc" rough={0.45} />
      </mesh>
      {/* brass frame */}
      {[[0, 1.1, 1.64, 0.05], [0, -1.1, 1.64, 0.05], [-0.8, 0, 0.05, 2.2], [0.8, 0, 0.05, 2.2]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.005]}>
          <boxGeometry args={[w, h, 0.09]} />
          <Mat color="#c9a24a" metal={0.85} rough={0.3} />
        </mesh>
      ))}
      {/* header band */}
      <mesh position={[0, 0.78, 0.04]}>
        <boxGeometry args={[1.5, 0.34, 0.02]} />
        <Mat color="#184831" rough={0.5} />
      </mesh>
      <mesh position={[0, 0.78, 0.055]}>
        <circleGeometry args={[0.09, 32]} />
        <Mat color="#c9a24a" metal={0.85} rough={0.3} />
      </mesh>
      {/* QR modules */}
      <group position={[-size / 2 + step / 2, 0.12 + size / 2 - step / 2, 0.045]}>
        {cells.map(([x, y]) => (
          <mesh key={`${x}-${y}`} position={[x * step, -y * step, 0.012]}>
            <boxGeometry args={[step * 0.88, step * 0.88, 0.03]} />
            <Mat color="#10241b" rough={0.6} />
          </mesh>
        ))}
      </group>
      {/* footer lines */}
      {[-0.82, -0.94].map((y, i) => (
        <mesh key={y} position={[0, y, 0.04]}>
          <boxGeometry args={[i ? 0.6 : 1.0, 0.045, 0.012]} />
          <Mat color="#b9b19a" />
        </mesh>
      ))}
    </group>
  );
}
