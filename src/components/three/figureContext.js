import { createContext, useContext } from 'react';

/**
 * reducedMotion: skip idle loops and entrance tweens (render the final pose once).
 * activeRef: `.current` is true while the surrounding card is hovered/focused.
 */
export const FigureContext = createContext({ reducedMotion: false, activeRef: { current: false } });
export const useFigure = () => useContext(FigureContext);
