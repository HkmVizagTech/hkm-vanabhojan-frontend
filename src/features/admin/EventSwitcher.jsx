import React from 'react';
import { HStack, Select, Text } from '@chakra-ui/react';
import { CalendarRange } from 'lucide-react';
import { useAdminEvent } from '../../context/AdminEventContext';

/** "Which year am I looking at?" Remembered between visits and shared by every admin list. */
export default function EventSwitcher() {
  const { events, selected, setSelected, loaded } = useAdminEvent();
  return (
    <HStack
      spacing={2}
      pl={3}
      pr={1}
      h="40px"
      bg="bg.card"
      borderWidth="1px"
      borderColor="border.soft"
      borderRadius="xl"
      aria-label="Event"
    >
      <CalendarRange size={16} />
      <Text fontSize="sm" color="text.muted" display={{ base: 'none', sm: 'block' }}>Event</Text>
      <Select
        size="sm"
        variant="unstyled"
        fontWeight="bold"
        w="auto"
        minW="150px"
        value={selected}
        isDisabled={!loaded}
        onChange={e => setSelected(e.target.value)}
        aria-label="Choose event"
      >
        <option value="all">All events</option>
        {events.map(e => (
          <option key={e._id} value={e._id}>
            {e.name}
            {e.isCurrent ? ' (current)' : ''}
          </option>
        ))}
      </Select>
    </HStack>
  );
}
