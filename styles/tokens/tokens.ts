/**
 * Design Tokens - TypeScript Types
 * 
 * TypeScript definitions for design tokens
 * Provides type safety when using tokens in TypeScript/React components
 */

/**
 * Color Token Types
 */
export const colors = {
  // Primary Brand Colors (validated from Figma)
  primaryTeal: '#277C78',    // Green
  primaryCyan: '#82C9D7',    // Cyan
  primaryBeige: '#F2CDAC',   // Yellow (beige/peach tone)
  primarySlate: '#626070',   // Navy
  primaryPurple: '#826CB0',  // Purple
  primaryRed: '#C94736',     // Red

  // Theme Palette (validated from Figma)
  themeGreen: '#277C78',
  themeYellow: '#F2CDAC',
  themeCyan: '#82C9D7',
  themeNavy: '#626070',
  themeRed: '#C94736',
  themePurple: '#826CB0',
  themePurpleAlt: '#AF81BA',  // Second purple variant
  themeTurquoise: '#597C7C',
  themeBrown: '#93674F',
  themeMagenta: '#934F6F',
  themeBlue: '#3F82B2',
  themeNavyGrey: '#97A0AC',
  themeArmyGreen: '#7F9161',
  themeGold: '#CAB361',
  themeOrange: '#BE6C49',
  themeWhite: '#FFFFFF',

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#C94736',  // Red theme from Figma
    600: '#C94736',
    700: '#B63E2D',
    800: '#A33524',
    900: '#8F2C1B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F2F2F2',  // Grey 100 from Figma
    200: '#E5E5E5',
    300: '#B3B3B3',  // Grey 300 from Figma
    400: '#A3A3A3',
    500: '#696868',  // Grey 500 from Figma
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#201F24',  // Grey 900 from Figma
    950: '#0A0A0A',
  },
  // Beige Scale (from Figma)
  beige: {
    100: '#F8F4F0',
    500: '#98908B',
  },
} as const;

/**
 * Spacing Token Types
 */
export const spacing = {
  base: 8,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Typography Token Types
 */
export const typography = {
  fontFamily: {
    primary: "'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

/**
 * Border Radius Token Types
 */
export const borderRadius = {
  none: 0,
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

/**
 * Breakpoint Token Types
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Transition Token Types
 */
export const transitions = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Z-Index Token Types
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Complete Design Tokens Object
 */
export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  breakpoints,
  transitions,
  zIndex,
} as const;

export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
export type TypographyToken = typeof typography;
export type BorderRadiusToken = typeof borderRadius;
export type BreakpointToken = typeof breakpoints;
export type TransitionToken = typeof transitions;
export type ZIndexToken = typeof zIndex;
