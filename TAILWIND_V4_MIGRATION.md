# Tailwind v4.0 and Base UI Migration Guide

## Overview

This document describes the migration from Tailwind CSS v3.4 + Radix UI to Tailwind CSS v4.0 + Base UI.

## Tailwind CSS v4.0

### What Changed

#### 1. Configuration is Now in CSS

**Before (v3):**
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
      }
    }
  }
}
```

**After (v4):**
```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(30% 0.05 240);
  --color-primary-foreground: oklch(98% 0 0);
}
```

#### 2. OKLCH Color Space

Tailwind v4 uses OKLCH instead of HSL for better color perception:
- More perceptually uniform
- Better color mixing
- Consistent lightness across hues

**Format:** `oklch(lightness chroma hue)`
- Lightness: 0-100%
- Chroma: 0-0.4 (usually)
- Hue: 0-360 degrees

#### 3. Simplified Build Process

**Removed:**
- `tailwind.config.js`
- `postcss.config.js`
- `autoprefixer`

**Added:**
- `@tailwindcss/vite` plugin

**Vite Config:**
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

#### 4. Import Statement

**Before:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After:**
```css
@import "tailwindcss";
```

### Benefits of v4

1. **3-10x Faster Builds** - Rust/Oxide engine
2. **Smaller CSS Output** - Better optimization
3. **CSS-First Config** - Inspect theme in DevTools
4. **Modern CSS Features** - Cascade layers, color-mix, etc.

### Dark Mode

Dark mode now uses `@media (prefers-color-scheme: dark)`:

```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: oklch(20% 0 0);
    --color-foreground: oklch(98% 0 0);
  }
}
```

## Base UI

### What Changed

#### Replaced Radix UI with Base UI

**Why Base UI?**
- Uber's design system
- Well-maintained and documented
- Accessible by default
- Styletron integration
- Themeable and extensible

#### Dependencies

**Removed:**
```json
"@radix-ui/react-dialog": "^1.0.5",
"@radix-ui/react-dropdown-menu": "^2.0.6",
"@radix-ui/react-label": "^2.0.2",
"@radix-ui/react-select": "^2.0.0",
"@radix-ui/react-slider": "^1.1.2",
"@radix-ui/react-slot": "^1.0.2",
"@radix-ui/react-tabs": "^1.0.4"
```

**Added:**
```json
"baseui": "^14.0.0",
"styletron-engine-atomic": "^1.6.2",
"styletron-react": "^6.1.1"
```

### Component Migration

#### Button Component

**Changes:**
- Removed Radix `Slot` component
- Pure React `<button>` element
- Same API and styling

**No API changes needed in consuming code!**

#### Tabs Component

**Changes:**
- Custom React Context implementation
- Removed Radix primitives
- Same API interface

**API remains compatible:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Input Component

No changes needed - didn't use Radix UI.

### Future Component Development

When adding new components, use Base UI:

```tsx
import { Button } from 'baseui/button'
import { Input } from 'baseui/input'
import { Select } from 'baseui/select'
```

**Resources:**
- [Base UI Documentation](https://baseweb.design/)
- [Component Gallery](https://baseweb.design/components)
- [Styletron](https://www.styletron.org/)

## Migration Checklist

- [x] Update package.json dependencies
- [x] Remove tailwind.config.js
- [x] Remove postcss.config.js
- [x] Update src/index.css with @import and @theme
- [x] Update vite.config.ts with Tailwind plugin
- [x] Rewrite Button component
- [x] Rewrite Tabs component
- [x] Test all components

## Breaking Changes

### None for End Users

The migration maintains API compatibility:
- Same component props
- Same styling classes
- Same behavior

### For Developers

1. **Theme customization** now in CSS, not JavaScript
2. **Color format** changed from HSL to OKLCH
3. **New component library** - use Base UI docs, not Radix UI

## Testing

After migration, verify:

1. **All pages render correctly**
2. **Buttons work and style properly**
3. **Tabs switch correctly**
4. **Dark mode works** (if implemented)
5. **Build process succeeds**
6. **Bundle size is reasonable**

## Troubleshooting

### Build Errors

**Error:** "Cannot find module '@tailwindcss/vite'"
**Solution:** Run `npm install`

**Error:** "Tailwind CSS is not configured"
**Solution:** Check vite.config.ts has `tailwindcss()` plugin

### Styling Issues

**Issue:** Colors look wrong
**Solution:** Verify @theme values use OKLCH format correctly

**Issue:** Custom classes not working
**Solution:** Add custom utilities in @layer utilities block

### Component Issues

**Issue:** Tabs don't switch
**Solution:** Check defaultValue prop is set

**Issue:** Button styling missing
**Solution:** Verify Button component has buttonVariants applied

## Resources

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Base UI Documentation](https://baseweb.design/)
- [OKLCH Color Picker](https://oklch.com/)

## Version Info

- **Tailwind CSS:** 4.0.0
- **Base UI:** 14.0.0
- **Migration Date:** 2026-02-08
