import React, { useState } from 'react';
import {
  Alert, AlertDescription, AlertIcon, Badge, Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, useDisclosure, useToast,
} from '@chakra-ui/react';
import { ShieldCheck } from 'lucide-react';
import { candidatesApi } from '../../../services/candidates';
import { getErrorMessage } from '../../../services/http';
import { formatDateTime, formatINR } from '../../../utils/format';

const ISSUE_LABELS = {
  captured_not_marked_paid: 'Paid at Razorpay, not marked Paid here',
  not_captured_at_razorpay: 'Marked Paid here, nothing at Razorpay',
  amount_differs: 'Amount differs',
  refunded_at_razorpay_only: 'Refunded at Razorpay only',
  refunded_here_only: 'Marked Refunded here only',
  lookup_failed: 'Could not check',
};

const Figure = ({ label, value, hint }) => (
  <Box p={4} borderRadius="xl" borderWidth="1px" borderColor="border.soft" bg="bg.subtle">
    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted">{label}</Text>
    <Text fontSize="2xl" fontWeight="bold" lineHeight="1.2">{formatINR(value)}</Text>
    {hint && <Text fontSize="xs" color="text.muted">{hint}</Text>}
  </Box>
);

/** "Check with Razorpay": proves the dashboard money matches Razorpay, and lists every registration that does not. */
export default function RazorpayCheck({ eventId }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    setLoading(true);
    try {
      setResult(await candidatesApi.auditPayments(eventId));
    } catch (error) {
      toast({ title: 'Razorpay check failed', description: getErrorMessage(error), status: 'error', duration: 6000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const open = () => {
    onOpen();
    run();
  };

  const settle = async () => {
    setSettling(true);
    try {
      const outcome = await candidatesApi.checkPending();
      toast({ title: outcome.message, status: 'success', duration: 4000, isClosable: true });
      await run();
    } catch (error) {
      toast({ title: 'Could not settle payments', description: getErrorMessage(error), status: 'error', duration: 6000, isClosable: true });
    } finally {
      setSettling(false);
    }
  };

  const needsSettling = result?.issues.some(i => i.type === 'captured_not_marked_paid');

  return (
    <>
      <Button variant="outline" leftIcon={<ShieldCheck size={16} />} onClick={open}>Check with Razorpay</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Razorpay check</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loading && !result ? (
              <Text color="text.muted">Asking Razorpay about every online payment. This can take a moment...</Text>
            ) : result && (
              <VStack align="stretch" spacing={5}>
                <Alert status={result.matches ? 'success' : 'warning'} borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>
                    {result.matches
                      ? `Everything matches: ${result.checked} online payments checked, dashboard and Razorpay agree.`
                      : `${result.issues.length} registration${result.issues.length === 1 ? '' : 's'} to look at. Dashboard minus Razorpay: ${formatINR(result.difference)}.`}
                  </AlertDescription>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  <Figure label="Dashboard: paid online" value={result.dashboard.paidOnline} hint={`Refunded here: ${formatINR(result.dashboard.refunded)}`} />
                  <Figure label="Razorpay: received (net)" value={result.razorpay.net} hint={`Captured ${formatINR(result.razorpay.captured)} · refunded ${formatINR(result.razorpay.refunded)}`} />
                  <Figure label="Cash at the desk" value={result.dashboard.cash} hint="Not in Razorpay; counted separately" />
                </SimpleGrid>

                {result.issues.length > 0 && (
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead><Tr><Th>Name</Th><Th>Problem</Th><Th isNumeric>Here</Th><Th isNumeric>Razorpay</Th></Tr></Thead>
                      <Tbody>
                        {result.issues.map(issue => (
                          <Tr key={issue.id}>
                            <Td><Text fontWeight="semibold">{issue.name}</Text><Text fontSize="xs" color="text.muted">{issue.phone}</Text></Td>
                            <Td><Badge colorScheme="orange" whiteSpace="normal">{ISSUE_LABELS[issue.type] || issue.type}</Badge><Text fontSize="xs" color="text.muted" mt={1}>{issue.detail}</Text></Td>
                            <Td isNumeric>{issue.ourStatus}<br />{formatINR(issue.ourAmount)}</Td>
                            <Td isNumeric>{issue.razorpayStatus}<br />{formatINR(issue.razorpayAmount)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}

                <Text fontSize="xs" color="text.muted">Checked {formatDateTime(result.checkedAt)}.</Text>
                <Box>
                  {needsSettling && <Button mr={3} colorScheme="green" onClick={settle} isLoading={settling}>Settle pending payments</Button>}
                  <Button variant="outline" onClick={run} isLoading={loading}>Check again</Button>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
