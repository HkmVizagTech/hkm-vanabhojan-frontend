import Lotus from './Lotus';
import Book from './Book';
import Ball from './Ball';
import Mridanga from './Mridanga';
import Thali from './Thali';
import Picnic from './Picnic';
import Pass from './Pass';

/**
 * Registry of 3D figures. `camera` is [x, y, z]; `extras` render beside the figure.
 * Keep figures procedural (no downloaded assets) so the chunk stays small.
 */
export const FIGURES = {
  lotus: { Component: Lotus, camera: [0, 2.9, 6.4], fov: 38, lookAt: [0, 0.3, 0] },
  book: { Component: Book, camera: [0, 0.5, 4.8], fov: 38, lookAt: [0, 0.15, 0] },
  ball: { Component: Ball, camera: [0, 0.5, 5.4], fov: 38, lookAt: [0, 0.35, 0] },
  mridanga: { Component: Mridanga, camera: [0, 0.2, 4.2], fov: 38, lookAt: [0, 0, 0] },
  thali: { Component: Thali, camera: [0, 1.2, 4.4], fov: 38, lookAt: [0, 0.3, 0] },
  pass: { Component: Pass, camera: [0, 0, 3.9], fov: 34, lookAt: [0, 0, 0], intensity: 0.9 },
  picnic: { Component: Picnic, camera: [0, 3.6, 7.8], fov: 40, lookAt: [0, 0.5, 0] },
};
