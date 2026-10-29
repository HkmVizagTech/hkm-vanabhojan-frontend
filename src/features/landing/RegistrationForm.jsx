import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormHelperText,
  Heading,
  HStack,
  Image,
  Input,
  Link,
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Select as ChakraSelect,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import { Link as RouterLink } from 'react-router-dom';
import { COLLEGE_YEARS, HOW_DID_YOU_KNOW } from '../../config/event';
import { useCurrentEvent } from '../../context/CurrentEventContext';
import { registrationApi } from '../../services/registration';
import { preloadRazorpay } from '../../hooks/useRazorpay';
import { ageOn, formatINR } from '../../utils/format';
import FormField from '../../components/common/FormField';
import { buildPayload, feeFor } from './validation';
import { useRegistrationForm } from './useRegistrationForm';
import { usePayment } from './usePayment';

const collegeSelectStyles = dark => ({
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: state.isFocused ? '#2f8a57' : '#c9e6d2',
    background: dark ? '#2d3748' : '#fff',
    boxShadow: 'none',
    '&:hover': { borderColor: '#20603d' },
  }),
  singleValue: base => ({ ...base, color: dark ? '#fff' : '#1a202c' }),
  input: base => ({ ...base, color: dark ? '#fff' : '#1a202c' }),
  menu: base => ({ ...base, zIndex: 20, background: dark ? '#2d3748' : '#fff' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#20603d' : state.isFocused ? (dark ? '#2f8a57' : '#e1f7e3') : 'transparent',
    color: state.isSelected || (dark && state.isFocused) ? '#fff' : dark ? '#e2e8f0' : '#20603d',
  }),
});

function FeeBanner({ event, category }) {
  const fee = feeFor(event, category);
  const info = event.fees[category];
  return (
    <Flex
      align="center"
      justify="space-between"
      gap={3}
      px={4}
      py={3}
      borderRadius="xl"
      bg={category === 'Working' ? 'lotus.50' : 'brand.50'}
      color={category === 'Working' ? 'lotus.600' : 'brand.700'}
      _dark={{ bg: 'whiteAlpha.100', color: 'white' }}
      aria-live="polite"
    >
      <Box>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
          Registration fee
        </Text>
        <Text fontSize="sm">{info ? info.label : 'Choose college student or others below'}</Text>
      </Box>
      <Text fontFamily="heading" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" lineHeight="1" whiteSpace="nowrap">
        {fee ? formatINR(fee) : `${formatINR(event.fees.College.amount)} / ${formatINR(event.fees.Working.amount)}`}
      </Text>
    </Flex>
  );
}

export default function RegistrationForm() {
  const { event } = useCurrentEvent();
  const { values, errors, setField, idCard, pickIdCard, clearIdCard, validate } = useRegistrationForm();
  const { pay, isPaying } = usePayment();
  const [colleges, setColleges] = useState([]);
  const dark = useColorModeValue(false, true);
  const selectStyles = useMemo(() => collegeSelectStyles(dark), [dark]);

  useEffect(() => {
    const controller = new AbortController();
    registrationApi
      .getColleges(controller.signal)
      .then(list => setColleges(list.map(c => ({ label: c.name, value: c.name }))))
      .catch(err => {
        if (!controller.signal.aborted) console.error('Failed to fetch colleges:', err);
      });
    return () => controller.abort();
  }, []);

  const isCollege = values.collegeOrWorking === 'College';
  const isWorking = values.collegeOrWorking === 'Working';
  const age = ageOn(values.dob);
  const outsideAge = age !== null && (age < event.ageLimit.min || age > event.ageLimit.max);
  const today = new Date().toISOString().split('T')[0];

  const text = name => ({
    value: values[name],
    onChange: e => setField(name, e.target.value),
  });

  const submit = e => {
    e.preventDefault();
    if (!validate()) return;
    pay({ payload: buildPayload(values), studentIdCard: isCollege ? idCard.file : null });
  };

  const cta = isCollege
    ? `Register Now for ${formatINR(feeFor(event, 'College'))} (Student)`
    : isWorking
      ? `Register Now for ${formatINR(feeFor(event, 'Working'))} (Professional)`
      : 'Register Now';

  return (
    <Card id="register" boxShadow="0 18px 50px -20px rgba(32,96,61,0.45)" scrollMarginTop="24px">
      <CardHeader textAlign="center" pb={2}>
        <Heading size="xl" color="text.heading">
          {event.name} Registration
        </Heading>
        <Text color="text.muted" mt={1} fontSize="sm">
          <Text as="span" color="red.500">*</Text> indicates required
        </Text>
      </CardHeader>
      <CardBody>
        <form onSubmit={submit} noValidate>
          <Stack spacing={5}>
            <FeeBanner event={event} category={values.collegeOrWorking} />

            <FormField id="name" label="Name" required error={errors.name}>
              <Input placeholder="Your full name" autoComplete="name" {...text('name')} />
            </FormField>

            <FormField
              id="dob"
              label="Date of Birth"
              required
              error={errors.dob}
              hint={outsideAge ? `Heads up: this festival is for ages ${event.ageLimit.label}.` : undefined}
            >
              <Input type="date" max={today} {...text('dob')} />
            </FormField>

            <FormField id="whatsappNumber" label="WhatsApp Number" required error={errors.whatsappNumber}>
              <InputGroup>
                <InputLeftAddon>+91</InputLeftAddon>
                <Input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Your WhatsApp number"
                  {...text('whatsappNumber')}
                />
              </InputGroup>
            </FormField>

            <FormField id="email" label="Email" required error={errors.email}>
              <Input type="email" autoComplete="email" placeholder="your.email@example.com" {...text('email')} />
            </FormField>

            <FormField id="gender" label="Gender" required error={errors.gender}>
              <RadioGroup value={values.gender} onChange={v => setField('gender', v)}>
                <HStack spacing={6}>
                  <Radio value="Male" colorScheme="brand">Male</Radio>
                  <Radio value="Female" colorScheme="brand">Female</Radio>
                </HStack>
              </RadioGroup>
            </FormField>

            <FormField id="collegeOrWorking" label="Are you a College Student or Others?" required error={errors.collegeOrWorking}>
              <ChakraSelect {...text('collegeOrWorking')}>
                <option value="">--Select--</option>
                <option value="College">College Student</option>
                <option value="Working">Others</option>
              </ChakraSelect>
              {isCollege && (
                <Alert status="success" mt={2} borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  Please carry your student ID card to the event for verification. Student rate:{' '}
                  <b>&nbsp;{formatINR(feeFor(event, 'College'))}</b>
                </Alert>
              )}
              {isWorking && (
                <Alert status="warning" mt={2} borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  Registration fee for working professionals: <b>&nbsp;{formatINR(feeFor(event, 'Working'))}</b>
                </Alert>
              )}
            </FormField>

            {isWorking && (
              <FormField id="companyName" label="Company Name" required error={errors.companyName}>
                <Input placeholder="Your company name" autoComplete="organization" {...text('companyName')} />
              </FormField>
            )}

            {isCollege && (
              <>
                <FormField id="college" label="College Name" required error={errors.college}>
                  {/* Pick from the list, or type any name: it is used exactly as typed. */}
                  <CreatableSelect
                    inputId="college"
                    options={colleges}
                    value={values.college ? { label: values.college, value: values.college } : null}
                    onChange={option => setField('college', option?.value || '')}
                    placeholder="Select your college, or type its name"
                    formatCreateLabel={typed => `Use "${typed}"`}
                    isValidNewOption={typed => typed.trim().length > 1}
                    noOptionsMessage={() => 'Type your college name'}
                    isClearable
                    styles={selectStyles}
                  />
                  <FormHelperText>Not in the list? Just type your college name and choose "Use ...".</FormHelperText>
                </FormField>

                <FormField id="course" label="Course" required error={errors.course}>
                  <Input placeholder="e.g., B.Tech, MBA" {...text('course')} />
                </FormField>

                <FormField id="year" label="Year" required error={errors.year}>
                  <ChakraSelect {...text('year')}>
                    <option value="">--Select Year--</option>
                    {COLLEGE_YEARS.map(y => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </ChakraSelect>
                </FormField>

                <FormField
                  id="studentIdCard"
                  label="Student ID Card (Optional)"
                  hint="A clear photo of your ID speeds up entry. JPG, PNG or WebP, max 5MB."
                >
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    p={1}
                    onChange={e => {
                      pickIdCard(e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                  {idCard.previewUrl && (
                    <Flex mt={3} align="center" gap={3}>
                      <Image
                        src={idCard.previewUrl}
                        alt="ID card preview"
                        maxH="120px"
                        maxW="200px"
                        objectFit="cover"
                        borderRadius="md"
                        borderWidth="1px"
                      />
                      <Button size="sm" colorScheme="red" variant="outline" onClick={clearIdCard}>
                        Remove
                      </Button>
                    </Flex>
                  )}
                </FormField>
              </>
            )}

            <FormField id="howDidYouKnow" label="How you came to know about this Fest" required error={errors.howDidYouKnow}>
              <ChakraSelect {...text('howDidYouKnow')}>
                <option value="">--Select--</option>
                {HOW_DID_YOU_KNOW.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </ChakraSelect>
            </FormField>

            <Button
              type="submit"
              variant="festival"
              size="lg"
              py={7}
              w="full"
              isLoading={isPaying}
              loadingText="Processing"
              onMouseEnter={preloadRazorpay}
              onFocus={preloadRazorpay}
            >
              {cta}
            </Button>
            <Text textAlign="center" fontSize="sm" color="text.muted">
              Secure payment via Razorpay. Already registered?{' '}
              <Link as={RouterLink} to="/attendance" color="brand.600" fontWeight="bold" textDecoration="underline">
                View your QR code
              </Link>
            </Text>
          </Stack>
        </form>
      </CardBody>
    </Card>
  );
}
