import React, { useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { HIGHLIGHTS } from '../../config/event';
import Figure from '../../components/three/Figure';
import TiltCard from '../../components/common/TiltCard';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';

function HighlightCard({ item }) {
  const [active, setActive] = useState(false);
  // The outer node is animated by <Reveal>; the hover transition lives on the inner card so the two never fight.
  return (
    <Box>
      <TiltCard
        h="100%"
        bg="bg.card"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border.soft"
        overflow="hidden"
        textAlign="center"
        transition="box-shadow .25s ease"
        _hover={{ boxShadow: '0 26px 44px -22px rgba(215,38,96,0.45)' }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onTouchStart={() => setActive(true)}
        onTouchEnd={() => setActive(false)}
      >
        <Box bgGradient="linear(to-b, saffron.50, transparent)" _dark={{ bgGradient: 'linear(to-b, whiteAlpha.100, transparent)' }}>
          <Figure name={item.figure} label={`3D illustration: ${item.title}`} active={active} h={{ base: '120px', md: '170px' }} />
        </Box>
        <Box px={{ base: 2.5, md: 4 }} pb={{ base: 4, md: 5 }}>
          <Heading as="h3" fontSize={{ base: 'lg', md: 'xl' }} color="text.heading">
            {item.title}
          </Heading>
          <Text mt={1} fontSize={{ base: 'xs', md: 'sm' }} color="text.muted">
            {item.text}
          </Text>
        </Box>
      </TiltCard>
    </Box>
  );
}

export default function Highlights() {
  return (
    <Container as="section" maxW="6xl" mt={{ base: 16, md: 24 }}>
      <SectionHeading eyebrow="What awaits you" title="One day. Four ways to feel alive." />
      <Reveal stagger={0.12}>
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 3, md: 5 }}>
          {HIGHLIGHTS.map(item => (
            <HighlightCard key={item.id} item={item} />
          ))}
        </SimpleGrid>
      </Reveal>
    </Container>
  );
}
