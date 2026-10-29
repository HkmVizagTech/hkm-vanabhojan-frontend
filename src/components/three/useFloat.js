import { useFrame } from '@react-three/fiber';
import { useFigure } from './figureContext';

/** Gentle bob + spin for a figure root. Spins faster while the host card is active. */
export function useFloat(ref, { baseY = 0, amp = 0.06, speed = 1.1, spin = 0.35, phase = 0 } = {}) {
  const { reducedMotion, activeRef } = useFigure();
  useFrame((state, delta) => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    node.position.y = baseY + Math.sin(state.clock.elapsedTime * speed + phase) * amp;
    node.rotation.y += delta * spin * (activeRef.current ? 3 : 1);
  });
}
