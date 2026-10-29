import React from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Image,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, GraduationCap, ScanLine, Users, CalendarPlus, Banknote, BarChart3, ListChecks, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/newLogo.png';

const LINKS = [
  { to: '/admin', label: 'All Candidates', icon: LayoutDashboard, roles: ['admin'] },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin'] },
  { to: '/admin/insights', label: 'Insights', icon: BarChart3, roles: ['admin'] },
  { to: '/admin/events', label: 'Events', icon: CalendarPlus, roles: ['admin'] },
  { to: '/admin/college', label: 'Colleges', icon: GraduationCap, roles: ['admin'] },
  { to: '/admin/staff', label: 'Staff', icon: Users, roles: ['admin'] },
  { to: '/admin/cash', label: 'Cash desk', icon: Banknote, roles: ['admin', 'user'], needsCash: true },
  { to: '/admin/AdminAttendanceScannedList', label: 'Scanned List', icon: ListChecks, roles: ['admin', 'user'] },
  { to: '/admin/adminqrscanner', label: 'QR Scanner', icon: ScanLine, roles: ['admin', 'user'] },
];

function NavItems({ onNavigate }) {
  const { role, logout, canCollectCash } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <VStack align="stretch" spacing={1}>
      {LINKS.filter(l => l.roles.includes(role) && (!l.needsCash || role === 'admin' || canCollectCash)).map(({ to, label, icon: IconCmp }) => {
        const active = pathname.toLowerCase() === to.toLowerCase();
        return (
          <HStack
            key={to}
            as={RouterLink}
            to={to}
            onClick={onNavigate}
            px={3}
            py={2.5}
            borderRadius="lg"
            spacing={3}
            fontWeight={active ? 'bold' : 'medium'}
            bg={active ? 'whiteAlpha.300' : 'transparent'}
            _hover={{ bg: 'whiteAlpha.200' }}
            aria-current={active ? 'page' : undefined}
          >
            <IconCmp size={18} />
            <Text>{label}</Text>
          </HStack>
        );
      })}
      <HStack
        as="button"
        type="button"
        onClick={toggleColorMode}
        px={3}
        py={2.5}
        mt={4}
        borderRadius="lg"
        spacing={3}
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        <Text>{colorMode === 'light' ? 'Dark mode' : 'Light mode'}</Text>
      </HStack>
      <HStack
        as="button"
        type="button"
        onClick={handleLogout}
        px={3}
        py={2.5}
        borderRadius="lg"
        spacing={3}
        color="red.200"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        <LogOut size={18} />
        <Text>Logout</Text>
      </HStack>
    </VStack>
  );
}

const Brand = () => (
  <HStack spacing={3} mb={6}>
    <Image src={logo} alt="" boxSize="40px" borderRadius="full" bg="white" />
    <Box lineHeight="1.1">
      <Text fontFamily="heading" fontSize="xl" fontWeight="bold">
        Vanabhojanam
      </Text>
      <Text fontSize="xs" opacity={0.75}>
        Admin console
      </Text>
    </Box>
  </HStack>
);

export const SIDEBAR_WIDTH = '230px';

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
        <IconButton
          aria-label="Open menu"
          icon={<Menu size={22} />}
          onClick={onOpen}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        />
        <Text fontFamily="heading" fontSize="xl" fontWeight="bold">
          Vanabhojanam
        </Text>
      </HStack>

      <Box
        as="nav"
        aria-label="Admin"
        display={{ base: 'none', md: 'block' }}
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w={SIDEBAR_WIDTH}
        p={4}
        zIndex={1300}
        color="white"
        bgGradient="linear(to-b, brand.700, brand.900)"
      >
        <Brand />
        <NavItems />
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent bgGradient="linear(to-b, brand.700, brand.900)" color="white">
          <DrawerCloseButton />
          <DrawerHeader fontFamily="heading">Vanabhojanam</DrawerHeader>
          <DrawerBody>
            <NavItems onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
