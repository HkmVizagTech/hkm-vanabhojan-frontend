import React from 'react';
import { Box, Container, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { BadgeIndianRupee, QrCode, ScanLine } from 'lucide-react';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';

const STEPS = [
  {
    icon: BadgeIndianRupee,
    title: 'Register and pay',
    text: 'Fill the short form and pay securely online.',
  },
  {
    icon: QrCode,
    title: 'Get your QR pass',
    text: 'Your pass is sent to the WhatsApp number you registered with. Students receive it once their ID is verified.',
  },
  {
    icon: ScanLine,
    title: 'Show it at the gate',
    text: 'Bring your QR (and your student ID card if you registered as a student). One quick scan and you are in.',
  },
];

export default function HowItWorks() {
  return (
    <Container as="section" id="how" maxW="6xl" mt={{ base: 16, md: 28 }} scrollMarginTop="90px">
      <SectionHeading eyebrow="Simple" title="Three steps to your seat" />
      <Reveal stagger={0.14}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }} position="relative">
          {STEPS.map((step, i) => (
            <Box key={step.title} position="relative">
              <Flex
                direction="column"
                h="100%"
                p={{ base: 5, md: 7 }}
                borderRadius="2xl"
                bg="bg.card"
                borderWidth="1px"
                borderColor="border.soft"
                boxShadow="soft"
              >
                <Flex align="center" justify="space-between" mb={5}>
                  <Flex boxSize="52px" borderRadius="xl" align="center" justify="center" bg="brand.600" color="white">
                    <step.icon size={24} />
                  </Flex>
                  <Text fontFamily="heading" fontWeight="500" fontSize="5xl" lineHeight="1" color="saffron.400">
                    {i + 1}
                  </Text>
                </Flex>
                <Heading as="h3" fontSize="2xl" color="text.heading">{step.title}</Heading>
                <Text mt={2} color="text.muted">{step.text}</Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Reveal>
    </Container>
  );
}
