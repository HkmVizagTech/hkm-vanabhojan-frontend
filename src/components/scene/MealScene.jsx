import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { meal } from './assets';

const SPARKS = [
  { left: '14%', top: '16%', delay: '0s' },
  { left: '34%', top: '9%', delay: '1.4s' },
  { left: '62%', top: '12%', delay: '0.7s' },
  { left: '80%', top: '24%', delay: '2.2s' },
  { left: '91%', top: '8%', delay: '3s' },
  { left: '50%', top: '30%', delay: '2.6s' },
];

/** Krishna and his friends sharing the forest meal: one painting, with light slowly drifting over it and fireflies. */
export default function MealScene({ label }) {
  return (
    <Box role="img" aria-label={label} position="relative" overflow="hidden" w="100%" sx={{ aspectRatio: '4 / 3' }} bg="#1a2a14">
      <Image
        src={meal}
        alt=""
        draggable={false}
        position="absolute"
        inset={0}
        w="100%"
        h="100%"
        objectFit="cover"
        animation="kcDrift 22s ease-in-out infinite alternate"
      />
      <Box
        aria-hidden="true"
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgImage="linear-gradient(115deg, transparent 22%, rgba(255,236,170,0.16) 40%, transparent 54%)"
        animation="kcRays 9s ease-in-out infinite"
      />
      {SPARKS.map((s, i) => (
        <Box
          key={i}
          aria-hidden="true"
          position="absolute"
          left={s.left}
          top={s.top}
          boxSize="4px"
          borderRadius="full"
          bg="#ffe9a8"
          boxShadow="0 0 10px 3px rgba(255,226,140,0.6)"
          animation={`firefly 4.5s ease-in-out ${s.delay} infinite`}
        />
      ))}
    </Box>
  );
}
