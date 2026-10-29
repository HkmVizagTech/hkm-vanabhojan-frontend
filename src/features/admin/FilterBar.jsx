import React from 'react';
import { Box, FormControl, FormLabel, Input, Select, SimpleGrid } from '@chakra-ui/react';

export const FilterBar = ({ children, columns = { base: 1, sm: 2, lg: 5 } }) => (
  <Box mb={4} p={3} bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.soft">
    <SimpleGrid columns={columns} spacing={3} alignItems="flex-end">
      {children}
    </SimpleGrid>
  </Box>
);

export const SelectFilter = ({ label, placeholder, value, onChange, options }) => (
  <FormControl>
    <FormLabel fontSize="xs">{label}</FormLabel>
    <Select size="sm" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </Select>
  </FormControl>
);

export const InputFilter = ({ label, value, onChange, ...rest }) => (
  <FormControl>
    <FormLabel fontSize="xs">{label}</FormLabel>
    <Input size="sm" value={value} onChange={e => onChange(e.target.value)} {...rest} />
  </FormControl>
);
