/**
 * Theme Colors
 * 
 * These are the predefined color themes for budgets and pots.
 * Colors match the design tokens from the Figma design.
 * 
 * SECURITY: Used for whitelist validation of theme colors
 */

export const THEMES = {
  Green: '#277C78',
  Yellow: '#F2CDAC',
  Cyan: '#82C9D7',
  Navy: '#626070',
  Red: '#C94736',
  Purple: '#826CB0',
  'Light Purple': '#AF81BA',
  Turquoise: '#597C7C',
  Brown: '#93674F',
  Magenta: '#934F6F',
  Blue: '#3F82B2',
  'Navy Grey': '#97A0AC',
  'Army Green': '#7F9161',
  Gold: '#CAB361',
  Orange: '#BE6C49',
} as const;

// Array of valid theme color values for validation
export const THEME_COLORS = Object.values(THEMES) as readonly string[];

// TypeScript type for theme names
export type ThemeName = keyof typeof THEMES;

// TypeScript type for theme colors
export type ThemeColor = typeof THEMES[ThemeName];

// Get theme color by name
export const getThemeColor = (name: ThemeName): ThemeColor => {
  return THEMES[name];
};

// Check if a color is a valid theme
export const isValidTheme = (color: string): boolean => {
  return Object.values(THEMES).includes(color as ThemeColor);
};

// Get theme name by color
export const getThemeName = (color: string): ThemeName | undefined => {
  const entry = Object.entries(THEMES).find(([_, value]) => value === color);
  return entry ? entry[0] as ThemeName : undefined;
};
