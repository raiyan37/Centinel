/**
 * Theme Colors
 *
 * These are the predefined color themes for budgets and pots.
 * Colors match the design tokens from the Figma design.
 *
 * SECURITY: Used for whitelist validation of theme colors
 */
export declare const THEMES: {
    readonly Green: "#277C78";
    readonly Yellow: "#F2CDAC";
    readonly Cyan: "#82C9D7";
    readonly Navy: "#626070";
    readonly Red: "#C94736";
    readonly Purple: "#826CB0";
    readonly 'Light Purple': "#AF81BA";
    readonly Turquoise: "#597C7C";
    readonly Brown: "#93674F";
    readonly Magenta: "#934F6F";
    readonly Blue: "#3F82B2";
    readonly 'Navy Grey': "#97A0AC";
    readonly 'Army Green': "#7F9161";
    readonly Gold: "#CAB361";
    readonly Orange: "#BE6C49";
};
export declare const THEME_COLORS: readonly string[];
export type ThemeName = keyof typeof THEMES;
export type ThemeColor = typeof THEMES[ThemeName];
export declare const getThemeColor: (name: ThemeName) => ThemeColor;
export declare const isValidTheme: (color: string) => boolean;
export declare const getThemeName: (color: string) => ThemeName | undefined;
//# sourceMappingURL=themes.d.ts.map