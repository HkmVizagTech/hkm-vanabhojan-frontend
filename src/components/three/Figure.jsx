import React, { Component, lazy, Suspense, useMemo, useRef } from 'react';
import { Box, usePrefersReducedMotion } from '@chakra-ui/react';
import { useInView } from '../../hooks/useInView';

// three.js is only downloaded once a figure is about to scroll into view.
const FigureCanvas = lazy(() => import('./FigureCanvas'));

const GLYPHS = {
  lotus: '🪷',
  book: '📖',
  ball: '⚽',
  mridanga: '🥁',
  thali: '🍛',
  picnic: '🌳',
};

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

class FigureBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn('3D figure failed, falling back to a static glyph.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Placeholder = ({ name }) => (
  <Box h="100%" display="grid" placeItems="center" fontSize="4xl" opacity={0.85} aria-hidden="true">
    {GLYPHS[name]}
  </Box>
);

/**
 * A small interactive 3D illustration.
 * Falls back to an emoji glyph when WebGL is unavailable, off-screen, or still loading.
 */
export default function Figure({ name, label, active = false, h = '180px', softEdges = false, ...boxProps }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useMemo(supportsWebGL, []);
  const fallback = <Placeholder name={name} />;

  return (
    <Box
      ref={ref}
      role="img"
      aria-label={label}
      h={h}
      w="100%"
      // Feathers the canvas rectangle into the page for scenes with no frame of their own.
      sx={softEdges ? { maskImage: 'radial-gradient(closest-side, #000 62%, transparent 100%)' } : undefined}
      {...boxProps}
    >
      {webgl && inView ? (
        <FigureBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <FigureCanvas name={name} active={active} reducedMotion={reducedMotion} />
          </Suspense>
        </FigureBoundary>
      ) : (
        fallback
      )}
    </Box>
  );
}
