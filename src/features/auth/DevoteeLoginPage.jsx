import React, { useEffect, useState } from 'react';
import { Button, Input, InputGroup, InputLeftAddon, Text, VStack, useToast } from '@chakra-ui/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { homeForRole, useAuth } from '../../context/AuthContext';
import { devoteesApi } from '../../services/devotees';
import { getErrorMessage } from '../../services/http';
import FormField from '../../components/common/FormField';
import AuthCard from './AuthCard';

/** Devotee sign-in: WhatsApp number, then the 6-digit code sent to it. View-only access to registrations and attendance. */
export default function DevoteeLoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { status, role, loginWithToken } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  if (status === 'authenticated') return <Navigate to={homeForRole(role)} replace />;

  const fail = (title, err) => toast({ title, description: getErrorMessage(err), status: 'error', duration: 5000, isClosable: true });

  const sendCode = async e => {
    e?.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) return toast({ title: 'Enter your 10-digit WhatsApp number', status: 'warning', duration: 3000 });
    setBusy(true);
    try {
      const res = await devoteesApi.requestCode(phone);
      setSent(true);
      setWait(60);
      toast({ title: 'Code sent', description: res.message, status: 'success', duration: 4000 });
    } catch (err) {
      fail('Could not send the code', err);
    } finally {
      setBusy(false);
    }
  };

  const verify = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await devoteesApi.verifyCode(phone, code);
      loginWithToken(data);
      navigate(homeForRole(data.role), { replace: true });
    } catch (err) {
      fail('Could not sign in', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Devotee Login" subtitle="Sign in with a code sent to your WhatsApp">
      <form onSubmit={sent ? verify : sendCode}>
        <VStack spacing={4}>
          <FormField id="phone" label="WhatsApp number" required>
            <InputGroup>
              <InputLeftAddon>+91</InputLeftAddon>
              <Input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Your WhatsApp number" value={phone} isReadOnly={sent} onChange={e => setPhone(e.target.value)} />
            </InputGroup>
          </FormField>
          {sent && (
            <FormField id="otp" label="6-digit code" required>
              <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter the code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} autoFocus />
            </FormField>
          )}
          <Button type="submit" variant="festival" isLoading={busy} w="full">{sent ? 'Verify and sign in' : 'Send code on WhatsApp'}</Button>
          {sent && (
            <>
              <Button variant="link" size="sm" onClick={sendCode} isDisabled={wait > 0 || busy}>{wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}</Button>
              <Button variant="link" size="sm" onClick={() => { setSent(false); setCode(''); }}>Use a different number</Button>
            </>
          )}
          <Text fontSize="xs" color="text.muted" textAlign="center">Only numbers added by the temple office can sign in. You will be able to view, not change, the data.</Text>
        </VStack>
      </form>
    </AuthCard>
  );
}
