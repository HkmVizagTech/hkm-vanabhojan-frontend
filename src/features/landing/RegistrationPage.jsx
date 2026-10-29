import React, { useCallback } from 'react';
import { Box, Container } from '@chakra-ui/react';
import PublicShell from '../../components/layout/PublicShell';
import SiteFooter from '../../components/layout/SiteFooter';
import Hero from './Hero';
import EventStrip from './EventStrip';
import Highlights from './Highlights';
import VanabhojanaStory from './VanabhojanaStory';
import RegistrationForm from './RegistrationForm';
import RegistrationClosed from './RegistrationClosed';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import StickyCta from './StickyCta';
import SectionHeading from '../../components/common/SectionHeading';
import { preloadRazorpay } from '../../hooks/useRazorpay';

export default function RegistrationPage() {
  const { event, status } = useCurrentEvent();
  const open = Boolean(event?.registrationOpen);
  const scrollToForm = useCallback(() => {
    preloadRazorpay();
    document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <PublicShell>
      <Hero onRegister={scrollToForm} />
      <EventStrip />
      <Highlights />
      <VanabhojanaStory />
      <Container as="section" id="register-section" maxW="2xl" mt={{ base: 16, md: 28 }} scrollMarginTop="16px">
        <SectionHeading eyebrow="Join us" title="Reserve your place" />
        <Box>
          {open ? <RegistrationForm /> : <RegistrationClosed event={event} loading={status === 'loading'} />}
        </Box>
      </Container>
      <SiteFooter />
      {open && <StickyCta targetId="register-section" onClick={scrollToForm} />}
    </PublicShell>
  );
}
