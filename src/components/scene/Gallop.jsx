import React from 'react';
import { Box, Image } from '@chakra-ui/react';

/**
 * Plays a few poses in a loop (a flip-book gallop) while bobbing, and crosses the screen from left to right,
 * then waits off-screen before running again. Pure CSS, so it costs nothing while idle.
 */
export default function Gallop({ sheet, height, delay = 1.5, cycle = 26, bottom = 0, ...rest }) {
  const { frames, ratio } = sheet;
  const flip = 0.54; // seconds for one full stride
  return (
    <Box
      aria-hidden="true"
      position="absolute"
      left={0}
      bottom={bottom}
      h={height}
      sx={{ aspectRatio: String(ratio) }}
      pointerEvents="none"
      zIndex={1}
      animation={`kcCross ${cycle}s linear ${delay}s infinite`}
      willChange="transform"
      {...rest}
    >
      <Box h="100%" w="100%" animation={`kcBob ${flip / 2}s ease-in-out infinite alternate`}>
        <Box position="relative" h="100%" w="100%">
          {frames.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              draggable={false}
              position="absolute"
              inset={0}
              h="100%"
              w="100%"
              objectFit="contain"
              opacity={i === 0 ? 1 : 0}
              animation={`kcFlip ${flip}s step-end ${-i * (flip / frames.length)}s infinite`}
              filter="drop-shadow(0 10px 10px rgba(0,0,0,0.35))"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
