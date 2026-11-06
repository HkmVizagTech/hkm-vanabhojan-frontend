import React, { useEffect, useState } from 'react';
import { Box, Button, HStack, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import { QrCode, Send } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { candidatesApi } from '../../../services/candidates';
import { getErrorMessage } from '../../../services/http';
import { needsApproval } from './needsApproval';

/** Lets an admin show a person's entry QR on screen, or resend it on WhatsApp, when they have lost it. */
export default function QrSection({ candidate: c }) {
  const toast = useToast();
  const [token, setToken] = useState(null);
  const [busy, setBusy] = useState('');

  useEffect(() => setToken(null), [c._id]);

  const eligible = c.paymentStatus === 'Paid' && (!needsApproval(c) || c.adminAction === 'Accepted');
  if (!eligible) {
    return needsApproval(c) && c.paymentStatus === 'Paid' ? (
      <Text fontSize="sm" color="text.muted">The entry QR is issued once you accept this student's ID.</Text>
    ) : null;
  }

  const show = async () => {
    setBusy('show');
    try {
      setToken((await candidatesApi.qr(c._id)).attendanceToken);
    } catch (error) {
      toast({ title: 'Could not load the QR', description: getErrorMessage(error), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBusy('');
    }
  };

  const send = async () => {
    setBusy('send');
    try {
      const result = await candidatesApi.sendQr(c._id);
      toast({ title: result.message, status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: 'QR not sent', description: getErrorMessage(error), status: 'error', duration: 6000, isClosable: true });
    } finally {
      setBusy('');
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Entry QR</Heading>
      <HStack spacing={3} wrap="wrap">
        <Button size="sm" variant="outline" leftIcon={<QrCode size={16} />} onClick={show} isLoading={busy === 'show'}>
          {token ? 'Refresh QR' : 'Show QR'}
        </Button>
        <Button size="sm" colorScheme="green" variant="outline" leftIcon={<Send size={16} />} onClick={send} isLoading={busy === 'send'}>
          Send on WhatsApp
        </Button>
      </HStack>
      {token && (
        <VStack mt={4} spacing={2} align="flex-start">
          <Box bg="white" p={3} borderRadius="lg" boxShadow="sm" borderWidth="1px">
            <QRCodeSVG value={token} size={176} />
          </Box>
          <Text fontSize="xs" color="text.muted">Staff only. Scan this at the gate; please do not share the screen.</Text>
        </VStack>
      )}
    </Box>
  );
}
