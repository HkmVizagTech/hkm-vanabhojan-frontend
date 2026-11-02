import React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  Tooltip,
  VStack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Banknote, BarChart3, CalendarCheck, CalendarPlus, GraduationCap, LayoutDashboard, ListChecks, LogOut, Menu, Moon, ScanLine, Sun, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg';

const GROUPS = [
  {
    label: 'Overview',
    links: [
      { to: '/admin', label: 'Candidates', icon: LayoutDashboard, roles: ['admin'] },
      { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin'] },
      { to: '/admin/insights', label: 'Insights', icon: BarChart3, roles: ['admin'] },
    ],
  },
  {
    label: 'Set up',
    links: [
      { to: '/admin/events', label: 'Events', icon: CalendarPlus, roles: ['admin'] },
      { to: '/admin/college', label: 'Colleges', icon: GraduationCap, roles: ['admin'] },
      { to: '/admin/staff', label: 'Staff', icon: Users, roles: ['admin'] },
    ],
  },
  {
    label: 'On the day',
    links: [
      { to: '/admin/cash', label: 'Cash desk', icon: Banknote, roles: ['admin', 'user'], needsCash: true },
      { to: '/admin/adminqrscanner', label: 'QR scanner', icon: ScanLine, roles: ['admin', 'user'] },
      { to: '/admin/AdminAttendanceScannedList', label: 'Scanned list', icon: ListChecks, roles: ['admin', 'user'] },
    ],
  },
];

const roleLabel = ({ role, isSuperAdmin }) => (isSuperAdmin ? 'Super admin' : role === 'admin' ? 'Admin' : 'Volunteer');

function NavItems({ onNavigate }) {
  const { role, canCollectCash } = useAuth();
  const { pathname } = useLocation();

  const groups = GROUPS.map(g => ({
    ...g,
    links: g.links.filter(l => l.roles.includes(role) && (!l.needsCash || role === 'admin' || canCollectCash)),
  })).filter(g => g.links.length);

  return (
    <VStack align="stretch" spacing={5}>
      {groups.map(group => (
        <Box key={group.label}>
          <Text px={3} mb={1.5} fontSize="10px" fontWeight="extrabold" letterSpacing="0.18em" textTransform="uppercase" color="whiteAlpha.600">
            {group.label}
          </Text>
          <VStack align="stretch" spacing={0.5}>
            {group.links.map(({ to, label, icon: IconCmp }) => {
              const active = pathname.toLowerCase() === to.toLowerCase();
              return (
                <HStack
                  key={to}
                  as={RouterLink}
                  to={to}
                  onClick={onNavigate}
                  position="relative"
                  px={3}
                  py={2.5}
                  borderRadius="xl"
                  spacing={3}
                  fontSize="sm"
                  fontWeight={active ? 'bold' : 'medium'}
                  color={active ? 'white' : 'whiteAlpha.800'}
                  bg={active ? 'whiteAlpha.200' : 'transparent'}
                  _hover={{ bg: active ? 'whiteAlpha.200' : 'whiteAlpha.100', color: 'white', textDecoration: 'none' }}
                  aria-current={active ? 'page' : undefined}
                  transition="background .15s"
                >
                  {active && <Box position="absolute" left="-12px" top="22%" bottom="22%" w="4px" borderRadius="full" bg="saffron.300" />}
                  <IconCmp size={18} />
                  <Text>{label}</Text>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}

function UserCard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const logoutNow = () => {
    auth.logout();
    navigate('/admin/login');
  };
  return (
    <Flex align="center" gap={3} p={3} borderRadius="2xl" bg="blackAlpha.300" borderWidth="1px" borderColor="whiteAlpha.200">
      <Avatar size="sm" name={auth.name || 'User'} bg="saffron.400" color="brand.900" />
      <Box minW={0} flex="1">
        <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{auth.name || 'Signed in'}</Text>
        <Badge mt={0.5} fontSize="9px" colorScheme={auth.isSuperAdmin ? 'orange' : auth.role === 'admin' ? 'green' : 'blue'} variant="subtle">
          {roleLabel(auth)}
        </Badge>
      </Box>
      <HStack spacing={0.5}>
        <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'} hasArrow>
          <IconButton aria-label="Toggle colour mode" icon={colorMode === 'light' ? <Moon size={16} /> : <Sun size={16} />} size="sm" variant="ghost" color="whiteAlpha.800" _hover={{ bg: 'whiteAlpha.200', color: 'white' }} onClick={toggleColorMode} />
        </Tooltip>
        <Tooltip label="Log out" hasArrow>
          <IconButton aria-label="Log out" icon={<LogOut size={16} />} size="sm" variant="ghost" color="red.200" _hover={{ bg: 'whiteAlpha.200' }} onClick={logoutNow} />
        </Tooltip>
      </HStack>
    </Flex>
  );
}

const Brand = () => (
  <HStack spacing={3} mb={7} px={1}>
    <Image src={logo} alt="" boxSize="42px" borderRadius="full" />
    <Box lineHeight="1.1">
      <Text fontFamily="heading" fontSize="xl" fontWeight="bold" lineHeight="1.1">Kartika Vanabhojanam</Text>
      <Text fontSize="xs" color="whiteAlpha.700">Admin console</Text>
    </Box>
  </HStack>
);

const PANEL = { bg: 'brand.800', color: 'white' };

export const SIDEBAR_WIDTH = '248px';

export default function Sidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <HStack
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="56px"
        px={3}
        zIndex={1400}
        bg="brand.700"
        color="white"
        boxShadow="md"
      >
        <IconButton aria-label="Open menu" icon={<Menu size={22} />} onClick={onOpen} variant="ghost" color="white" _hover={{ bg: 'whiteAlpha.200' }} />
        <Text fontFamily="heading" fontSize="xl" fontWeight="bold" lineHeight="1.1">Kartika Vanabhojanam</Text>
      </HStack>

      <Flex
        as="nav"
        aria-label="Admin"
        direction="column"
        display={{ base: 'none', md: 'flex' }}
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w={SIDEBAR_WIDTH}
        px={4}
        pt={5}
        pb={4}
        zIndex={1300}
        overflowY="auto"
        {...PANEL}
      >
        <Brand />
        <Box flex="1"><NavItems /></Box>
        <UserCard />
      </Flex>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerContent {...PANEL}>
          <DrawerCloseButton />
          <DrawerBody px={4} pt={5} pb={4} display="flex" flexDirection="column">
            <Brand />
            <Box flex="1"><NavItems onNavigate={onClose} /></Box>
            <UserCard />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
