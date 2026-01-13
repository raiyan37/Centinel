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
};
// Array of valid theme color values for validation
export const THEME_COLORS = Object.values(THEMES);
// Get theme color by name
export const getThemeColor = (name) => {
    return THEMES[name];
};
// Check if a color is a valid theme
export const isValidTheme = (color) => {
    return Object.values(THEMES).includes(color);
};
// Get theme name by color
export const getThemeName = (color) => {
    const entry = Object.entries(THEMES).find(([_, value]) => value === color);
    return entry ? entry[0] : undefined;
};
//# sourceMappingURL=themes.js.map