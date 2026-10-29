import React from 'react';

/** Low-poly friendly material shorthand. */
export const Mat = ({ color, rough = 0.78, metal = 0, flat = true, ...rest }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} flatShading={flat} {...rest} />
);
