import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { forest, meal } from './assets';

const SPARKS = [
  { left: '12%', top: '18%', delay: '0s' },
  { left: '30%', top: '9%', delay: '1.4s' },
  { left: '58%', top: '14%', delay: '0.7s' },
  { left: '78%', top: '22%', delay: '2.2s' },
  { left: '90%', top: '10%', delay: '3s' },
  { left: '48%', top: '30%', delay: '2.6s' },
];

/** Krishna and his friends sharing the forest meal, in a sunlit clearing with drifting light and fireflies. */
export default function MealScene({ label, h = { base: '320px', md: '440px' } }) {
  return (
    <Box
      role="img"
      aria-label={label}
      position="relative"
      overflow="hidden"
      h={h}
      w="100%"
      bgColor="#0e2a1d"
      bgImage={`linear-gradient(180deg, rgba(8,22,15,0.10) 0%, rgba(8,22,15,0.62) 100%), url(${forest})`}
      bgSize="cover"
      bgPosition="center"
    >
      <Box
        aria-hidden="true"
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgImage="linear-gradient(115deg, transparent 20%, rgba(255,236,170,0.20) 38%, transparent 52%)"
        animation="kcRays 8s ease-in-out infinite"
      />
      <Image
        src={meal}
        alt=""
        draggable={false}
        position="absolute"
        left="50%"
        bottom="-2%"
        h="92%"
        maxW="104%"
        objectFit="contain"
        animation="kcMeal 5.5s ease-in-out infinite"
        filter="drop-shadow(0 16px 18px rgba(0,0,0,0.4))"
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
