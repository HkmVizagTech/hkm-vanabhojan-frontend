import React from 'react';
import { Box, Center, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PublicShell from '../../components/layout/PublicShell';
import logo from '../../assets/logo.svg';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <PublicShell>
      <Center minH="100vh" px={4} py={10}>
        <Box w="full" maxW="md" bg="bg.card" p={{ base: 6, md: 8 }} borderRadius="3xl" boxShadow="xl" borderWidth="1px" borderColor="border.soft">
          <VStack spacing={1} mb={6}>
            <Image src={logo} alt="" boxSize="64px" borderRadius="full" />
            <Heading size="lg" color="text.heading">{title}</Heading>
            {subtitle && <Text color="text.muted" fontSize="sm">{subtitle}</Text>}
          </VStack>
          {children}
        </Box>
      </Center>
    </PublicShell>
  );
}
