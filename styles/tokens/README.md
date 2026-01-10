# Design Tokens Documentation

This directory contains all design tokens for the Personal Finance App.

## Structure

```
styles/tokens/
├── colors.css          # Color palette and semantic colors
├── typography.css      # Font families, sizes, weights, line heights
├── spacing.css         # Spacing scale, padding, margins
├── borders.css         # Border radius, width, style
├── shadows.css         # Box shadows and elevation
├── breakpoints.css     # Responsive breakpoints
├── transitions.css     # Animation timings and easing
├── index.css           # Main entry point (imports all tokens)
├── tokens.ts           # TypeScript definitions
└── README.md           # This file
```

## Usage

### In CSS/SCSS

Import the main tokens file:

```css
@import './styles/tokens/index.css';

/* Or import specific tokens */
@import './styles/tokens/colors.css';
@import './styles/tokens/spacing.css';
```

Use CSS custom properties:

```css
.my-component {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-colors);
}
```

### In TypeScript/React

Import the TypeScript definitions:

```typescript
import { tokens, colors, spacing, typography } from './styles/tokens/tokens';

// Use in inline styles
const styles = {
  color: colors.primaryTeal,
  padding: spacing[4],
  fontSize: typography.fontSize.lg,
};

// Or use CSS custom properties with style prop
<div style={{ color: 'var(--color-primary-teal)' }} />
```

### In React with CSS Modules

```tsx
import './Button.module.css';

// Button.module.css
.button {
  color: var(--color-text-primary);
  background-color: var(--color-interactive-primary);
  padding: var(--spacing-button-padding-y) var(--spacing-button-padding-x);
  border-radius: var(--border-radius-button);
  transition: var(--transition-button);
}
```

## Token Categories

### Colors

- **Primary Colors**: Brand colors from data.json themes
- **Theme Palette**: 15 theme colors for budgets and pots
- **Semantic Colors**: Success, error, warning, info (with 50-900 scale)
- **Neutral Colors**: Gray scale (50-950)
- **Background Colors**: Primary, secondary, tertiary, elevated, overlay
- **Text Colors**: Primary, secondary, tertiary, disabled, inverse, link
- **Border Colors**: Default, hover, focus, error, disabled
- **Interactive Colors**: Primary, secondary with hover/active states
- **Status Colors**: Paid, due, overdue, pending
- **Amount Colors**: Income (green), expense (red)

### Typography

- **Font Families**: Primary (Public Sans), Mono
- **Font Weights**: 300 (light) to 700 (bold)
- **Font Sizes**: xs (12px) to 5xl (48px)
- **Line Heights**: none (1) to loose (2)
- **Letter Spacing**: tighter to widest
- **Typography Scale**: H1-H6, body, caption, label, button, link, amount

### Spacing

- **Base Unit**: 8px grid system
- **Scale**: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), etc.
- **Semantic Names**: xs, sm, md, lg, xl, 2xl, 3xl
- **Component-Specific**: Button padding, input padding, card padding, container padding
- **Layout**: Container max-width, sidebar width, header height

### Borders

- **Border Radius**: none (0) to full (9999px)
- **Component-Specific**: Button, input, card, modal, avatar, badge, progress
- **Border Width**: none, thin (1px), medium (2px), thick (3px)
- **Border Style**: solid, dashed, dotted
- **Border Colors**: Default, hover, focus, error, disabled

### Shadows

- **Shadow Scale**: xs to 2xl
- **Elevation Levels**: 0 (none) to 6 (highest)
- **Component-Specific**: Card, button, modal, dropdown, tooltip
- **Focus Rings**: Blue (default), red (error)

### Breakpoints

- **Breakpoints**: xs (0), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Container Max Widths**: Matching breakpoint values
- **Usage**: Use in media queries or CSS container queries

### Transitions

- **Durations**: instant (0ms) to slower (500ms)
- **Timing Functions**: linear, in, out, in-out, bounce
- **Common Transitions**: all, colors, opacity, transform, shadow
- **Component-Specific**: Button, input, modal, sidebar, dropdown

## Validation Required

⚠️ **Important**: All token values should be validated against the Figma design file. Current values are estimates based on:
- Colors extracted from `data.json`
- Modern design system best practices
- Common patterns for personal finance applications

### Values to Validate in Figma:

1. **Colors**: Exact hex codes for semantic colors, backgrounds, text colors
2. **Typography**: Exact font sizes, line heights, letter spacing
3. **Spacing**: Exact padding/margin values for components
4. **Border Radius**: Exact values for each component
5. **Shadows**: Exact shadow values (offset, blur, spread, opacity)
6. **Breakpoints**: Exact breakpoint values if different
7. **Transitions**: Exact durations and easing curves

## Best Practices

1. **Always use tokens**: Never hardcode colors, spacing, or other values
2. **Use semantic names**: Prefer `--color-text-primary` over `--color-neutral-900`
3. **Component-specific tokens**: Use component tokens when available (e.g., `--spacing-button-padding-x`)
4. **Consistent spacing**: Use the spacing scale (multiples of 8px)
5. **Accessibility**: Ensure sufficient color contrast (WCAG AA minimum)
6. **TypeScript**: Use the TypeScript definitions for type safety in React components

## Updating Tokens

When updating token values:

1. Update the CSS custom property in the relevant `.css` file
2. Update the TypeScript definition in `tokens.ts` if needed
3. Update this documentation if adding new tokens
4. Verify all components using the token still look correct
5. Run accessibility checks for color contrast

## Resources

- [Figma Design File](https://www.figma.com/design/Plo0FsVIRBuDRmv8N5eX79/personal-finance-app?node-id=182-285&m=dev&t=byAYhpFqn8rqfPsQ-1)
- [Public Sans Font](https://public-sans.digital.gov/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
