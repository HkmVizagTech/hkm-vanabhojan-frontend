import { extendTheme } from '@chakra-ui/react';

// Deep forest green with ivory neutrals and a restrained brass accent.
const brand = {
  50: '#eef4f0',
  100: '#d7e5db',
  200: '#b3ccbc',
  300: '#8aaf98',
  400: '#5f8f74',
  500: '#3b7355',
  600: '#1f5a3d',
  700: '#184831',
  800: '#12362a',
  900: '#0b241b',
};

// "saffron" and "lotus" are kept as token names used across the app, now muted: brass and dusty rose.
const saffron = {
  50: '#faf5e8',
  100: '#f1e6c6',
  200: '#e5d2a0',
  300: '#d6bb78',
  400: '#c9a24a',
  500: '#b4893a',
  600: '#966f2c',
  700: '#745522',
  800: '#523c18',
  900: '#33250f',
};

const lotus = {
  50: '#f8eeee',
  100: '#eed6d6',
  200: '#e1b9bb',
  300: '#d09ba0',
  400: '#bf7e86',
  500: '#a8646f',
  600: '#8a4f5a',
  700: '#6b3d46',
  800: '#4c2b32',
  900: '#2f1a1f',
};

export const theme = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
  colors: { brand, saffron, lotus },
  fonts: {
    heading: "'Cormorant Garamond', 'Times New Roman', serif",
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    deva: "'Noto Serif Devanagari', serif",
  },
  radii: { xl: '10px', '2xl': '14px', '3xl': '18px' },
  shadows: {
    soft: '0 1px 2px rgba(16,32,24,0.05), 0 8px 24px -14px rgba(16,32,24,0.16)',
    lift: '0 2px 4px rgba(16,32,24,0.06), 0 18px 36px -20px rgba(16,32,24,0.28)',
  },
  semanticTokens: {
    colors: {
      'bg.page': { default: '#faf8f3', _dark: '#0e1a14' },
      'bg.card': { default: 'white', _dark: 'gray.800' },
      'bg.subtle': { default: 'blackAlpha.50', _dark: 'whiteAlpha.100' },
      'text.heading': { default: 'brand.700', _dark: 'brand.100' },
      'text.muted': { default: 'gray.600', _dark: 'gray.400' },
      'border.soft': { default: 'blackAlpha.100', _dark: 'whiteAlpha.200' },
    },
  },
  styles: {
    global: {
      '@keyframes firefly': { '0%, 100%': { opacity: 0.1, transform: 'translateY(0)' }, '50%': { opacity: 1, transform: 'translateY(-10px)' } },
      '@keyframes heroSheen': { from: { backgroundPosition: '100% 0' }, to: { backgroundPosition: '0% 0' } },
      body: { bg: 'bg.page', color: 'gray.800', _dark: { color: 'gray.100' }, WebkitFontSmoothing: 'antialiased' },
      '@media (prefers-reduced-motion: reduce)': {
        '*': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
      },
    },
  },
  components: {
    Heading: { baseStyle: { fontWeight: 600, letterSpacing: '0' } },
    Button: {
      baseStyle: { fontWeight: 600, borderRadius: 'lg' },
      variants: {
        // Brass action for dark surfaces.
        brass: {
          bg: 'saffron.400',
          color: 'brand.900',
          transition: 'background .15s ease',
          _hover: { bg: 'saffron.300', _disabled: { bg: 'saffron.400' } },
          _active: { bg: 'saffron.500' },
        },
        // Primary action: solid deep green, no gradient, no motion.
        festival: {
          bg: 'brand.600',
          color: 'white',
          boxShadow: '0 1px 2px rgba(16,32,24,0.2)',
          transition: 'background .15s ease, box-shadow .15s ease',
          _hover: { bg: 'brand.700', boxShadow: '0 6px 16px -8px rgba(16,32,24,0.45)', _disabled: { bg: 'brand.600' } },
          _active: { bg: 'brand.800' },
          _disabled: { opacity: 0.5, cursor: 'not-allowed' },
        },
      },
      defaultProps: { colorScheme: 'brand' },
    },
    Input: {
      defaultProps: { focusBorderColor: 'brand.500' },
      variants: { outline: { field: { bg: 'bg.card', borderWidth: '1px', borderColor: 'gray.300', _dark: { borderColor: 'whiteAlpha.300' } } } },
    },
    Select: { defaultProps: { focusBorderColor: 'brand.500' } },
    FormLabel: { baseStyle: { fontWeight: 600, color: 'text.heading', fontSize: 'sm' } },
    Table: { baseStyle: { th: { fontFamily: 'body', fontWeight: 700, color: 'text.muted' } } },
    Card: {
      baseStyle: { container: { borderRadius: '2xl', bg: 'bg.card', borderWidth: '1px', borderColor: 'border.soft', boxShadow: 'soft' } },
    },
  },
});
