import React, { useState } from 'react';
import { Badge, Box, Button, Flex, HStack, IconButton, Switch, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import { Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../services/auth';
import { getErrorMessage } from '../../../services/http';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { formatDate } from '../../../utils/format';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ErrorNotice from '../../../components/common/ErrorNotice';
import PageSpinner from '../../../components/common/PageSpinner';
import PageHeader from '../PageHeader';
import DataTable from '../DataTable';
import AddStaffModal from './AddStaffModal';

export default function StaffPage() {
  const toast = useToast();
  const { userId, isSuperAdmin } = useAuth();
  const add = useDisclosure();
  const { data, loading, error, reload, setData } = useAsyncData(signal => authApi.listUsers(signal), []);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Why the controls on a row are locked, or '' when they are available.
  const lockReason = u => {
    if (u._id === userId) return 'This is your own account';
    if (u.role === 'admin' && !isSuperAdmin) return 'Only the super admin can manage admins';
    return '';
  };

  const toggleActive = async u => {
    setBusyId(u._id);
    try {
      const updated = await authApi.updateUser(u._id, { active: !u.active });
      setData(prev => prev.map(x => (x._id === u._id ? { ...x, ...updated } : x)));
      toast({ title: updated.active ? `${u.name} enabled` : `${u.name} disabled`, description: updated.active ? undefined : 'They are signed out and cannot log in.', status: 'success', duration: 3500 });
    } catch (err) {
      toast({ title: 'Could not update', description: getErrorMessage(err), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBusyId(null);
    }
  };

  const toggleCash = async u => {
    setBusyId(u._id);
    try {
      const updated = await authApi.updateUser(u._id, { canCollectCash: !u.canCollectCash });
      setData(prev => prev.map(x => (x._id === u._id ? { ...x, ...updated } : x)));
      toast({ title: updated.canCollectCash ? `${u.name} can now take cash` : `${u.name} can no longer take cash`, status: 'success', duration: 3500 });
    } catch (err) {
      toast({ title: 'Could not update', description: getErrorMessage(err), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    setBusyId(toDelete._id);
    try {
      await authApi.deleteUser(toDelete._id);
      setData(prev => prev.filter(x => x._id !== toDelete._id));
      toast({ title: `${toDelete.name} deleted`, status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Could not delete', description: getErrorMessage(err), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: u => (
        <HStack>
          <Text fontWeight="semibold">{u.name}</Text>
          {u._id === userId && <Badge colorScheme="purple">You</Badge>}
        </HStack>
      ),
    },
    { key: 'email', header: 'Email', render: u => u.email },
    { key: 'role', header: 'Role', render: u => <Badge colorScheme={u.role === 'admin' ? 'orange' : 'blue'}>{u.role === 'admin' ? 'Admin' : 'Volunteer'}</Badge> },
    { key: 'added', header: 'Added', render: u => formatDate(u.createdAt) },
    {
      key: 'status',
      header: 'Access',
      render: u => {
        const reason = lockReason(u);
        return (
          <Tooltip label={reason} isDisabled={!reason} hasArrow>
            <HStack spacing={2} display="inline-flex">
              <Switch
                colorScheme="brand"
                isChecked={u.active !== false}
                isDisabled={Boolean(reason) || busyId === u._id}
                onChange={() => toggleActive(u)}
                aria-label={`${u.active !== false ? 'Disable' : 'Enable'} ${u.name}`}
              />
              <Badge colorScheme={u.active !== false ? 'green' : 'red'}>{u.active !== false ? 'Active' : 'Disabled'}</Badge>
            </HStack>
          </Tooltip>
        );
      },
    },
    {
      key: 'cash',
      header: 'Cash desk',
      render: u => {
        if (u.role === 'admin') return <Text fontSize="sm" color="text.muted">Always</Text>;
        const reason = lockReason(u);
        return (
          <Tooltip label={reason} isDisabled={!reason} hasArrow>
            <HStack spacing={2} display="inline-flex">
              <Switch
                colorScheme="brand"
                isChecked={Boolean(u.canCollectCash)}
                isDisabled={Boolean(reason) || busyId === u._id}
                onChange={() => toggleCash(u)}
                aria-label={`${u.canCollectCash ? 'Remove' : 'Give'} cash desk access for ${u.name}`}
              />
              <Text fontSize="sm">{u.canCollectCash ? 'Can take cash' : 'No'}</Text>
            </HStack>
          </Tooltip>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: u => {
        const reason = lockReason(u);
        return (
          <Tooltip label={reason} isDisabled={!reason} hasArrow>
            <Box display="inline-block">
              <IconButton
                aria-label={`Delete ${u.name}`}
                icon={<Trash2 size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                isDisabled={Boolean(reason)}
                onClick={() => setToDelete(u)}
              />
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box maxW="1000px" mx="auto">
      <PageHeader title="Staff" subtitle="Everyone who can sign in to this admin console">
        <Button leftIcon={<UserPlus size={16} />} variant="festival" onClick={add.onOpen}>Add staff</Button>
      </PageHeader>
      <ErrorNotice error={error} onRetry={reload} />

      <DataTable
        columns={columns}
        rows={data}
        emptyText="No staff yet. Add a volunteer to let them use the QR scanner."
      />
      <Flex mt={3} color="text.muted" fontSize="xs" gap={1}>
        Disabling someone signs them out straight away. {isSuperAdmin ? '' : 'Admin accounts can only be managed by the super admin.'}
      </Flex>

      <AddStaffModal
        isOpen={add.isOpen}
        onClose={add.onClose}
        canCreateAdmin={isSuperAdmin}
        onCreated={form => {
          toast({ title: 'Account created', description: `${form.email} can now sign in.`, status: 'success', duration: 4000 });
          reload();
        }}
      />

      <ConfirmDialog isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} confirmLabel="Delete" title="Delete account" isLoading={busyId === toDelete?._id}>
        Delete <strong>{toDelete?.name}</strong> ({toDelete?.email})? They lose access immediately. To keep the account but block it, disable it instead.
      </ConfirmDialog>
    </Box>
  );
}
