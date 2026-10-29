import { extendTheme } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const shimmer = keyframes`0% { transform: translateX(-120%); } 60%, 100% { transform: translateX(120%); }`;

const brand = {
  50: '#e8f5ec',
  100: '#c9e6d2',
  200: '#a6d6b6',
  300: '#7fc296',
  400: '#58ac77',
  500: '#2f8a57',
  600: '#20603d', // festival green
  700: '#194c31',
  800: '#123824',
  900: '#0b2517',
};

const saffron = {
  50: '#fff6e5',
  100: '#ffe6b8',
  200: '#ffd48a',
  300: '#ffc15c',
  400: '#f6ab2e',
  500: '#e8920c',
  600: '#c0750a',
  700: '#955a08',
  800: '#6b4106',
  900: '#412704',
};

const lotus = {
  50: '#fde8ef',
  100: '#f9c3d4',
  200: '#f49cb7',
  300: '#ee759b',
  400: '#e44d82',
  500: '#d72660', // accent used on the old fee labels
  600: '#b01e4e',
  700: '#88173c',
  800: '#600f2a',
  900: '#380819',
};

export const theme = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
  colors: { brand, saffron, lotus },
  fonts: {
    heading: "'Cormorant Garamond', 'Times New Roman', serif",
    body: "'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    deva: "'Noto Serif Devanagari', serif",
  },
  semanticTokens: {
    colors: {
      'bg.page': { default: '#f6f3e8', _dark: '#0e1a13' },
      'bg.card': { default: 'white', _dark: 'gray.800' },
      'bg.subtle': { default: 'blackAlpha.50', _dark: 'whiteAlpha.100' },
      'text.heading': { default: 'brand.700', _dark: 'brand.100' },
      'text.muted': { default: 'gray.600', _dark: 'gray.400' },
      'border.soft': { default: 'blackAlpha.100', _dark: 'whiteAlpha.200' },
    },
  },
  styles: {
    global: {
      body: { bg: 'bg.page', color: 'gray.800', _dark: { color: 'gray.100' } },
      '@media (prefers-reduced-motion: reduce)': {
        '*': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
      },
    },
  },
  components: {
    Heading: { baseStyle: { fontWeight: 700, letterSpacing: '0.01em' } },
    Button: {
      baseStyle: { fontWeight: 700, borderRadius: 'xl' },
      variants: {
        festival: {
          bgGradient: 'linear(to-r, brand.600, brand.400)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          _after: {
            content: '""',
            position: 'absolute',
            inset: 0,
            bg: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)',
            animation: `${shimmer} 3.6s ease-in-out infinite`,
            pointerEvents: 'none',
          },
          boxShadow: '0 10px 24px -10px rgba(32,96,61,0.7)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 14px 28px -10px rgba(32,96,61,0.8)',
            // Chakra resets `bg` on hover of a disabled button, which would wipe the gradient.
            _disabled: { transform: 'none', bgGradient: 'linear(to-r, brand.600, brand.400)', boxShadow: 'none' },
          },
          _active: { transform: 'translateY(0)' },
          transition: 'all .2s ease',
        },
      },
      defaultProps: { colorScheme: 'brand' },
    },
    Input: {
      defaultProps: { focusBorderColor: 'brand.500' },
      variants: {
        outline: { field: { bg: 'bg.card', borderWidth: '2px', borderColor: 'brand.100' } },
      },
    },
    Select: { defaultProps: { focusBorderColor: 'brand.500' } },
    Table: {
      baseStyle: {
        th: { fontFamily: 'body', fontWeight: 800, color: 'text.muted' },
      },
    },
    FormLabel: { baseStyle: { fontWeight: 700, color: 'text.heading', fontSize: 'sm' } },
    Card: {
      baseStyle: {
        container: { borderRadius: '2xl', bg: 'bg.card', borderWidth: '1px', borderColor: 'border.soft' },
      },
    },
  },
});
