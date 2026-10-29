import React, { useState } from 'react';
import { Button, Input, VStack, useToast } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { homeForRole, useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/http';
import FormField from '../../components/common/FormField';
import AuthCard from './AuthCard';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const bind = name => ({
    name,
    value: form[name],
    onChange: e => setForm(prev => ({ ...prev, [name]: e.target.value })),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const role = await login(form);
      toast({ title: 'Login successful.', description: 'Welcome back!', status: 'success', duration: 3000, isClosable: true });
      // Send people back to the page that bounced them, when they are allowed on it.
      const from = location.state?.from?.pathname;
      navigate(role === 'admin' && from ? from : homeForRole(role), { replace: true });
    } catch (err) {
      toast({ title: 'Login failed.', description: getErrorMessage(err, 'Something went wrong.'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Admin Login" subtitle="Sign in to manage Vanabhojanam">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormField id="email" label="Email" required>
            <Input type="email" placeholder="Enter your email" autoComplete="email" {...bind('email')} />
          </FormField>
          <FormField id="password" label="Password" required>
            <Input type="password" placeholder="Enter your password" autoComplete="current-password" {...bind('password')} />
          </FormField>
          <Button type="submit" variant="festival" isLoading={isLoading} w="full">Login</Button>
        </VStack>
      </form>
    </AuthCard>
  );
}
