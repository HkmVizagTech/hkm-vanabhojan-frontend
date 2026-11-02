import React from 'react';

/** Satin material: smooth shading with a soft clear-coat, for a refined studio look. */
export const Mat = ({ color, rough = 0.5, metal = 0, flat = false, ...rest }) => (
  <meshPhysicalMaterial color={color} roughness={rough} metalness={metal} clearcoat={0.35} clearcoatRoughness={0.45} flatShading={flat} {...rest} />
);
