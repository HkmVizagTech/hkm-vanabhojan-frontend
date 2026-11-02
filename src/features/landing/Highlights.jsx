import React, { useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { HIGHLIGHTS } from '../../config/event';
import Figure from '../../components/three/Figure';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';

function HighlightCard({ item }) {
  const [active, setActive] = useState(false);
  // The outer node is animated by <Reveal>; the hover transition lives on the inner card so the two never fight.
  return (
    <Box>
      <Box
        h="100%"
        bg="brand.900"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="blackAlpha.300"
        overflow="hidden"
        textAlign="center"
        transition="box-shadow .25s ease"
        _hover={{ boxShadow: 'lift' }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onTouchStart={() => setActive(true)}
        onTouchEnd={() => setActive(false)}
      >
        <Box bgImage="radial-gradient(ellipse 70% 70% at 50% 55%, rgba(201,162,74,0.22), transparent 75%)">
          <Figure name={item.figure} label={`3D illustration: ${item.title}`} active={active} h={{ base: '120px', md: '170px' }} />
        </Box>
        <Box px={{ base: 2.5, md: 4 }} pb={{ base: 4, md: 5 }}>
          <Heading as="h3" fontSize={{ base: 'lg', md: 'xl' }} color="white">
            {item.title}
          </Heading>
          <Text mt={1} fontSize={{ base: 'xs', md: 'sm' }} color="whiteAlpha.700">
            {item.text}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default function Highlights() {
  return (
    <Container as="section" id="highlights" maxW="6xl" mt={{ base: 16, md: 28 }} scrollMarginTop="90px">
      <SectionHeading eyebrow="What awaits you" title="One day. Four experiences." />
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
