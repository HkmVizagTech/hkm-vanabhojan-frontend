import React, { useEffect, useState } from 'react';
import {
  Button, Checkbox, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Text,
} from '@chakra-ui/react';
import { authApi } from '../../../services/auth';
import { getErrorMessage } from '../../../services/http';
import FormField from '../../../components/common/FormField';

const empty = { name: '', email: '', password: '', role: 'user', canCollectCash: false };

/** Creates a login. Only the super admin is offered the Admin role. */
export default function AddStaffModal({ isOpen, onClose, canCreateAdmin, onCreated }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(empty);
      setError('');
    }
  }, [isOpen]);

  const bind = name => ({ value: form[name], onChange: e => setForm(prev => ({ ...prev, [name]: e.target.value })) });

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await authApi.register(form);
      onCreated(form);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the account'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit} borderRadius="2xl">
        <ModalHeader>Add staff</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormField id="staff-name" label="Name" required>
              <Input placeholder="Full name" autoComplete="off" {...bind('name')} />
            </FormField>
            <FormField id="staff-email" label="Email" required>
              <Input type="email" placeholder="staff@example.com" autoComplete="off" {...bind('email')} />
            </FormField>
            <FormField id="staff-password" label="Password" required hint="At least 8 characters. Share it with them privately.">
              <Input type="password" autoComplete="new-password" {...bind('password')} />
            </FormField>
            <FormField id="staff-role" label="Role" hint="Volunteers can use the QR scanner and see the scanned list only.">
              <Select {...bind('role')}>
                <option value="user">Volunteer (scanner)</option>
                {canCreateAdmin && <option value="admin">Admin</option>}
              </Select>
            </FormField>
            {form.role === 'user' && (
              <Checkbox
                colorScheme="brand"
                isChecked={form.canCollectCash}
                onChange={e => setForm(prev => ({ ...prev, canCollectCash: e.target.checked }))}
                alignItems="flex-start"
              >
                <Text fontWeight="semibold" lineHeight="1.2">Can take cash payments</Text>
                <Text fontSize="xs" color="text.muted">Gets the Cash desk: registers walk-ins, takes the cash and sends them their QR on WhatsApp.</Text>
              </Checkbox>
            )}
            {error && <Text color="red.500" fontSize="sm" role="alert">{error}</Text>}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="festival" isLoading={saving}>Create account</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
