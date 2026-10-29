import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { FIGURES } from './figures';
import { FigureContext } from './figureContext';

/** Lazy chunk: three.js + react-three-fiber + every figure live behind this import. */
export default function FigureCanvas({ name, active = false, reducedMotion = false }) {
  const config = FIGURES[name];
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const context = useMemo(() => ({ reducedMotion, activeRef }), [reducedMotion]);

  if (!config) return null;
  const { Component, Extras, camera, fov, lookAt } = config;

  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      camera={{ position: camera, fov }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      onCreated={({ camera: cam }) => cam.lookAt(...lookAt)}
      style={{ touchAction: 'pan-y' }}
    >
      <hemisphereLight args={['#fff6e6', '#5f8a55', 1.15]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff0d2" />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#ffd0e0" />
      <FigureContext.Provider value={context}>
        <Component />
        {Extras && <Extras />}
      </FigureContext.Provider>
    </Canvas>
  );
}
