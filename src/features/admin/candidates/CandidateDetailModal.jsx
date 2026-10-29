import React from 'react';
import {
  Avatar, Box, Button, Divider, Grid, GridItem, Heading, HStack, Icon, Image, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Tag, Text, VStack, Wrap, WrapItem,
} from '@chakra-ui/react';
import { AlertTriangle, CalendarDays, Check, CheckCircle2, Eye, Mail, Phone, RotateCcw, X } from 'lucide-react';
import { formatDate, formatDateTime, formatINR } from '../../../utils/format';
import { ADMIN_ACTION_COLORS, PAYMENT_COLORS } from './constants';

const Stat = ({ icon, color, label, children }) => (
  <Box bg="bg.subtle" p={4} borderRadius="lg" borderWidth="1px" borderColor="border.soft">
    <HStack spacing={3}>
      {icon && <Icon as={icon} color={color} boxSize={5} />}
      <VStack align="start" spacing={0} minW={0}>
        <Text fontSize="sm" color="text.muted">{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{children}</Text>
      </VStack>
    </HStack>
  </Box>
);

const Pair = ({ label, children }) => (
  <HStack align="flex-start">
    <Text fontSize="sm" color="text.muted" minW="80px">{label}</Text>
    <Box fontSize="sm" fontWeight="medium">{children}</Box>
  </HStack>
);

export default function CandidateDetailModal({ candidate, isOpen, onClose, onAction, busy }) {
  if (!candidate) return null;
  const c = candidate;
  const isCollege = c.collegeOrWorking === 'College';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent maxH="90vh" borderRadius="2xl" overflow="hidden">
        <ModalHeader bgGradient="linear(to-r, brand.600, brand.400)" color="white">
          <HStack spacing={3}>
            <Avatar name={c.name} size="md" bg="white" color="brand.600" />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">{c.name}</Text>
              <Text fontSize="sm" opacity={0.9}>Registration Details</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Payment Information</Heading>
                <Tag size="lg" borderRadius="full" colorScheme={PAYMENT_COLORS[c.paymentStatus] || 'gray'}>{c.paymentStatus}</Tag>
              </HStack>
              <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
                <Stat icon={RotateCcw} color="green.500" label="Payment Amount">
                  {c.paymentAmount ? formatINR(c.paymentAmount) : 'N/A'}
                </Stat>
                <Stat icon={Eye} color="blue.500" label="Order ID">{c.orderId || 'N/A'}</Stat>
                <Stat icon={CalendarDays} color="purple.500" label="Payment Date">{formatDate(c.paymentDate) || 'N/A'}</Stat>
                <Stat label="Method">{c.paymentMethod || 'N/A'}</Stat>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb={4}>Personal Information</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    <HStack><Icon as={Mail} color="teal.500" /><Text fontSize="sm" fontWeight="medium">{c.email}</Text></HStack>
                    <HStack><Icon as={Phone} color="green.500" /><Text fontSize="sm" fontWeight="medium">{c.whatsappNumber}</Text></HStack>
                    <Pair label="Gender:"><Tag size="sm" colorScheme="purple">{c.gender}</Tag></Pair>
                    <Pair label="DOB:">{formatDate(c.dob) || 'N/A'}</Pair>
                    <Pair label="Source:"><Tag size="sm" colorScheme="teal" variant="outline">{c.howDidYouKnow || 'Not specified'}</Tag></Pair>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    <Pair label="Type:"><Tag size="sm" colorScheme="blue">{c.collegeOrWorking}</Tag></Pair>
                    {isCollege ? (
                      <>
                        <Pair label="College:">{c.college || 'N/A'}</Pair>
                        <Pair label="Course:">{c.course || 'N/A'}</Pair>
                        <Pair label="Year:">{c.year || 'N/A'}</Pair>
                      </>
                    ) : (
                      <Pair label="Company:">{c.companyName || 'N/A'}</Pair>
                    )}
                  </VStack>
                </GridItem>
              </Grid>
            </Box>

            {isCollege && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={4}>Student ID Card</Heading>
                  {c.studentIdCardUrl ? (
                    <VStack spacing={4}>
                      <Image src={c.studentIdCardUrl} alt="Student ID Card" maxH="300px" maxW="400px" objectFit="contain" borderRadius="lg" borderWidth="2px" boxShadow="md" />
                      <Button variant="outline" colorScheme="blue" leftIcon={<Eye size={16} />} onClick={() => window.open(c.studentIdCardUrl, '_blank', 'noopener')}>
                        View Full Size
                      </Button>
                    </VStack>
                  ) : (
                    <Box p={8} textAlign="center" bg="red.50" _dark={{ bg: 'red.900' }} borderWidth="2px" borderStyle="dashed" borderColor="red.200" borderRadius="lg">
                      <Icon as={AlertTriangle} color="red.400" boxSize={8} mb={2} />
                      <Text color="red.600" fontWeight="medium">No ID Card Uploaded</Text>
                      <Text fontSize="sm" color="red.500">Student verification may be required</Text>
                    </Box>
                  )}
                </Box>
              </>
            )}

            <Divider />
            <Box>
              <Heading size="md" mb={4}>Registration Details</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(190px, 1fr))" gap={4}>
                <GridItem><Text fontSize="sm" color="text.muted">Registration Date</Text><Text fontSize="sm" fontWeight="medium">{formatDate(c.registrationDate) || 'N/A'}</Text></GridItem>
                <GridItem><Text fontSize="sm" color="text.muted">Serial Number</Text><Text fontSize="sm" fontWeight="medium">{c.serialNo || 'N/A'}</Text></GridItem>
                <GridItem>
                  <Text fontSize="sm" color="text.muted">Attendance</Text>
                  <HStack>
                    {c.attendance ? <CheckCircle2 size={16} color="#38a169" /> : <AlertTriangle size={16} color="#ed8936" />}
                    <Text fontSize="sm" fontWeight="medium" color={c.attendance ? 'green.600' : 'orange.600'}>{c.attendance ? 'Present' : 'Not Marked'}</Text>
                  </HStack>
                </GridItem>
                <GridItem><Text fontSize="sm" color="text.muted">Receipt</Text><Text fontSize="sm" fontWeight="medium">{c.receipt || 'N/A'}</Text></GridItem>
                <GridItem>
                  <Text fontSize="sm" color="text.muted">Admin Action</Text>
                  <Tag size="sm" variant={c.adminAction ? 'solid' : 'outline'} colorScheme={ADMIN_ACTION_COLORS[c.adminAction] || 'gray'}>
                    {c.adminAction || 'Pending'}
                  </Tag>
                  {c.adminActionDate && <Text fontSize="xs" color="text.muted" mt={1}>{formatDateTime(c.adminActionDate)}</Text>}
                </GridItem>
              </Grid>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg="bg.subtle" p={4}>
          <Wrap spacing={3} justify="center" w="full">
            <WrapItem><Button colorScheme="green" leftIcon={<Check size={16} />} onClick={() => onAction('accept', c._id)} isLoading={busy}>Accept</Button></WrapItem>
            <WrapItem><Button colorScheme="red" leftIcon={<X size={16} />} onClick={() => onAction('reject', c._id)} isLoading={busy}>Reject</Button></WrapItem>
            <WrapItem><Button colorScheme="orange" leftIcon={<RotateCcw size={16} />} onClick={() => onAction('refund', c._id)} isLoading={busy}>Refund</Button></WrapItem>
            <WrapItem><Button variant="ghost" onClick={onClose}>Close</Button></WrapItem>
          </Wrap>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
