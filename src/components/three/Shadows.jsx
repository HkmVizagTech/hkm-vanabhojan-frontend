import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/** Opts every solid mesh in the scene into soft shadows, so each figure grounds itself without per-mesh flags. */
export default function Shadows() {
  const scene = useThree(state => state.scene);
  useEffect(() => {
    scene.traverse(obj => {
      if (!obj.isMesh || obj.material.transparent) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
  });
  return null;
}
