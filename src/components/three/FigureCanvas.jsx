import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { FIGURES } from './figures';
import { FigureContext } from './figureContext';
import Studio from './Studio';
import Shadows from './Shadows';

/** Lazy chunk: three.js + react-three-fiber + every figure live behind this import. */
export default function FigureCanvas({ name, active = false, reducedMotion = false }) {
  const config = FIGURES[name];
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const context = useMemo(() => ({ reducedMotion, activeRef }), [reducedMotion]);

  if (!config) return null;
  const { Component, Extras, camera, fov, lookAt, intensity } = config;

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      camera={{ position: camera, fov }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power', toneMappingExposure: 1 }}
      onCreated={({ camera: cam }) => cam.lookAt(...lookAt)}
      style={{ touchAction: 'pan-y' }}
    >
      <Studio intensity={intensity ?? 0.5} />
      <hemisphereLight args={['#ffffff', '#8a9a8e', 0.35]} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.6}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={6}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#dfe8f0" />
      <FigureContext.Provider value={context}>
        <Component />
        {Extras && <Extras />}
        <Shadows />
      </FigureContext.Provider>
    </Canvas>
  );
}
