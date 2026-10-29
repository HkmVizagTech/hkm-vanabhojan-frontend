import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Center, Flex, HStack, IconButton, Input, InputGroup, InputLeftElement, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { GraduationCap, Pencil, Plus, Check, Search, Trash2 } from 'lucide-react';
import { collegesApi } from '../../../services/colleges';
import { getErrorMessage } from '../../../services/http';
import { useAsyncData } from '../../../hooks/useAsyncData';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ErrorNotice from '../../../components/common/ErrorNotice';
import PageSpinner from '../../../components/common/PageSpinner';
import PageHeader from '../PageHeader';

export default function CollegesPage() {
  const toast = useToast();
  const { data: colleges, loading, error, reload } = useAsyncData(signal => collegesApi.list(signal), []);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [bulkText, setBulkText] = useState('');
  const [bulkMode, setBulkMode] = useState(false);

  const visible = useMemo(
    () => colleges.filter(c => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [colleges, query]
  );

  const resetForm = useCallback(() => {
    setName('');
    setEditingId(null);
  }, []);

  const save = async () => {
    if (!name.trim()) {
      toast({ title: 'College name required!', status: 'warning' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await collegesApi.update(editingId, name.trim());
        toast({ title: 'College updated.', status: 'success' });
      } else {
        await collegesApi.create(name.trim());
        toast({ title: 'College added.', status: 'success' });
      }
      resetForm();
      await reload();
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed'), status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const saveBulk = async () => {
    const names = bulkText.split('\n').map(n => n.trim()).filter(Boolean);
    if (!names.length) return;
    setSaving(true);
    try {
      const { created, skipped } = await collegesApi.bulk(names);
      toast({ title: `${created} college${created === 1 ? '' : 's'} added`, description: skipped ? `${skipped} skipped (already in the list)` : undefined, status: 'success' });
      setBulkText('');
      setBulkMode(false);
      await reload();
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed'), status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await collegesApi.remove(toDelete._id);
      toast({ title: 'College deleted.', status: 'info' });
      if (editingId === toDelete._id) resetForm();
      await reload();
    } catch {
      toast({ title: 'Delete failed.', status: 'error' });
    } finally {
      setSaving(false);
      setToDelete(null);
    }
  };

  if (loading && colleges.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <Box maxW="760px" mx="auto">
      <PageHeader title="College Manager" subtitle="Add, edit, or remove colleges for your system." />
      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch colleges." />

      <Stack spacing={3} p={4} mb={6} bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.soft">
        <HStack>
          <Center boxSize="40px" borderRadius="full" bg="brand.50" color="brand.600" _dark={{ bg: 'brand.900', color: 'brand.200' }}>
            <GraduationCap size={20} />
          </Center>
          <Text fontWeight="bold">{editingId ? 'Edit college' : 'Add a college'}</Text>
        </HStack>
        {bulkMode ? (
          <>
            <Textarea
              placeholder={'One college per line, for example:\nAndhra University\nGITAM University\nVignan Institute'}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              rows={8}
              aria-label="Colleges, one per line"
            />
            <HStack>
              <Button flex="1" leftIcon={<Plus size={16} />} onClick={saveBulk} isLoading={saving} isDisabled={!bulkText.trim()} variant="festival">
                Add all
              </Button>
              <Button variant="ghost" onClick={() => setBulkMode(false)}>Cancel</Button>
            </HStack>
          </>
        ) : (
          <>
            <Input
              placeholder="Enter College Name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              aria-label="College name"
            />
            <HStack>
              <Button
                flex="1"
                leftIcon={editingId ? <Check size={16} /> : <Plus size={16} />}
                onClick={save}
                isLoading={saving}
                isDisabled={!name.trim()}
                variant="festival"
              >
                {editingId ? 'Update College' : 'Add College'}
              </Button>
              {editingId ? (
                <Button variant="ghost" onClick={resetForm}>Cancel Edit</Button>
              ) : (
                <Button variant="outline" onClick={() => setBulkMode(true)}>Add many at once</Button>
              )}
            </HStack>
          </>
        )}
      </Stack>

      <Flex justify="space-between" align="center" mb={3} gap={3} wrap="wrap">
        <Text fontWeight="bold">{colleges.length === 0 ? 'No colleges yet.' : `All Colleges (${colleges.length})`}</Text>
        <InputGroup maxW="260px" size="sm">
          <InputLeftElement pointerEvents="none"><Search size={14} /></InputLeftElement>
          <Input placeholder="Search colleges" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search colleges" />
        </InputGroup>
      </Flex>

      <Stack spacing={2}>
        {visible.map(college => (
          <Flex
            key={college._id}
            align="center"
            justify="space-between"
            gap={2}
            px={4}
            py={2}
            bg="bg.card"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={editingId === college._id ? 'brand.400' : 'border.soft'}
            transition="all .2s"
            _hover={{ boxShadow: 'md', borderColor: 'brand.300' }}
          >
            <Text flex="1" wordBreak="break-word">{college.name}</Text>
            <HStack spacing={1} flexShrink={0}>
              <IconButton aria-label={`Edit ${college.name}`} icon={<Pencil size={16} />} size="sm" variant="ghost" isRound onClick={() => { setName(college.name); setEditingId(college._id); }} />
              <IconButton aria-label={`Delete ${college.name}`} icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" isRound onClick={() => setToDelete(college)} />
            </HStack>
          </Flex>
        ))}
        {colleges.length > 0 && visible.length === 0 && <Text color="text.muted" textAlign="center" py={6}>No colleges match "{query}".</Text>}
      </Stack>

      <ConfirmDialog isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} confirmLabel="Delete" isLoading={saving} title="Delete college">
        Delete <strong>{toDelete?.name}</strong>? Existing registrations keep their college name.
      </ConfirmDialog>
    </Box>
  );
}
