import React from 'react';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Container, Link, Text } from '@chakra-ui/react';
import { EVENT } from '../../config/event';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { formatINR } from '../../utils/format';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';

/** Answers built from the current event, so they never go stale from year to year. */
function buildFaqs(event) {
  const items = [];
  if (event) {
    items.push({
      q: 'Who can join?',
      a: 'College students and working youth are both welcome.',
    });
    items.push({
      q: 'How much is the registration fee?',
      a: `${formatINR(event.fees.College.amount)} for college students and ${formatINR(event.fees.Working.amount)} for everyone else.`,
    });
    items.push({
      q: 'When and where is it?',
      a: `${event.dateLabel}${event.venue.name ? ` at ${event.venue.name}` : ''}${event.venue.address ? `, ${event.venue.address}` : ''}. Use the "Get directions" button near the top to open the map.`,
    });
  }
  items.push(
    {
      q: 'What should I bring?',
      a: 'Your QR pass from WhatsApp and, if you registered as a student, your college ID card for verification.',
    },
    {
      q: 'I did not get my QR. What now?',
      a: 'Your QR is sent only to the WhatsApp number you registered with, so it stays private. Students receive it after their ID is verified. If it still has not arrived, contact us and we will resend it.',
    },
    {
      q: 'Can I register friends or family?',
      a: 'Yes. Each person registers separately. If you use the same WhatsApp number, you can see all of their QR codes together on one page, and each person scans their own at the gate.',
    },
    {
      q: 'Who do I contact with questions?',
      a: (
        <>
          Write to{' '}
          <Link href={`mailto:${EVENT.contact.email}`} color="brand.600" fontWeight="bold" textDecoration="underline">
            {EVENT.contact.email}
          </Link>
          .
        </>
      ),
    }
  );
  return items;
}

export default function Faq() {
  const { event } = useCurrentEvent();
  const faqs = buildFaqs(event);
  return (
    <Container as="section" id="faq" maxW="3xl" mt={{ base: 16, md: 28 }} scrollMarginTop="90px">
      <SectionHeading eyebrow="Good to know" title="Questions, answered" />
      <Reveal>
        <Accordion allowToggle defaultIndex={[0]} display="flex" flexDirection="column" gap={3}>
          {faqs.map(f => (
            <AccordionItem key={f.q} border="none" bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.soft" overflow="hidden" boxShadow="0 12px 28px -24px rgba(32,96,61,0.6)">
              <AccordionButton px={{ base: 4, md: 6 }} py={4} _hover={{ bg: 'bg.subtle' }}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>{f.q}</Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={{ base: 4, md: 6 }} pb={5}>
                <Text color="text.muted">{f.a}</Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Container>
  );
}
