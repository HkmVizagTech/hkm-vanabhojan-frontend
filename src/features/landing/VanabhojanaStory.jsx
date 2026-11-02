import React from 'react';
import { Box, Container, Flex, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Leaf } from 'lucide-react';
import { VANABHOJANA } from '../../config/vanabhojana';
import Figure from '../../components/three/Figure';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';

export default function VanabhojanaStory() {
  return (
    <Box
      as="section"
      id="about"
      scrollMarginTop="70px"
      mt={{ base: 16, md: 28 }}
      py={{ base: 14, md: 24 }}
      color="white"
      position="relative"
      overflow="hidden"
      bg="brand.800"
    >
    <Container maxW="6xl" position="relative">
      <SectionHeading light eyebrow="The name" title={VANABHOJANA.title} />
      <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={{ base: 6, md: 12 }}>
        <Box
          flex="1.1"
          w="100%"
          borderRadius="2xl"
          overflow="hidden"
          borderWidth="1px"
          bgGradient="linear(to-b, #a9d0c6, #efe6c0 62%, #c9dca7)"
          boxShadow="0 24px 48px -26px rgba(0,0,0,0.6)"
          borderColor="whiteAlpha.200"
        >
          <Figure name="picnic" label="Krishna and the cowherd boys sharing lunch in the forest" h={{ base: '300px', md: '420px' }} />
        </Box>
        <VStack flex="1" align="flex-start" spacing={5}>
          <Reveal>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8" color="whiteAlpha.900">
              {VANABHOJANA.lead}
            </Text>
          </Reveal>
          <Reveal stagger={0.12} w="100%">
            <VStack align="stretch" spacing={3}>
              {VANABHOJANA.points.map(p => (
                <HStack key={p} align="flex-start" spacing={3} p={3} borderRadius="lg" bg="whiteAlpha.100" borderWidth="1px" borderColor="whiteAlpha.200">
                  <Icon as={Leaf} color="saffron.300" mt={1} boxSize={5} />
                  <Text>{p}</Text>
                </HStack>
              ))}
            </VStack>
          </Reveal>
        </VStack>
      </Flex>

      <Reveal stagger={0.12} mt={{ base: 10, md: 14 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }}>
          {VANABHOJANA.steps.map((step, i) => (
            <Flex key={step.title} gap={4} p={{ base: 4, md: 5 }} borderRadius="xl" bg="whiteAlpha.100" borderWidth="1px" borderColor="whiteAlpha.200" direction={{ base: 'row', lg: 'column' }}>
              <Text fontFamily="heading" fontWeight="500" fontSize={{ base: '3xl', lg: '4xl' }} color="saffron.300" lineHeight="1" minW="1.4ch">
                {i + 1}
              </Text>
              <Box>
                <Text fontWeight="bold">{step.title}</Text>
                <Text mt={1} fontSize="sm" color="whiteAlpha.800">{step.text}</Text>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>
      </Reveal>

      <Reveal mt={8} textAlign="center" maxW="2xl" mx="auto">
        <Text fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontStyle="italic" color="saffron.200">
          {VANABHOJANA.closing}
        </Text>
      </Reveal>
    </Container>
    </Box>
  );
}
