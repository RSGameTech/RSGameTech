
# Rebuild Components with shadcn/ui

## Overview
Refactor all custom components to use shadcn/ui primitives while preserving the existing glassmorphism aesthetic, theme system, and animations. The project already has many shadcn/ui components installed -- this plan leverages them throughout.

## Components to Rebuild

### 1. Navbar (`src/components/Navbar.tsx`)
- Replace custom dropdown with shadcn `DropdownMenu` for both theme switcher and mobile menu
- Replace raw `<button>` elements with shadcn `Button` (ghost/outline variants)
- Remove manual open/close state and click-outside logic (handled by Radix)

### 2. HeroSection (`src/components/HeroSection.tsx`)
- Replace `GlassContainer` with shadcn `Card` + glass className overrides
- Use `Badge` for the tagline pill instead of a custom styled `<span>`
- Use `Button` (variant="ghost") for social icon links

### 3. AboutSection (`src/components/AboutSection.tsx`)
- Replace `GlassContainer` with shadcn `Card` (CardHeader + CardContent) + glass classes
- Use `Separator` between content blocks for cleaner visual spacing

### 4. ToolkitSection (`src/components/ToolkitSection.tsx`)
- Replace `GlassContainer` with shadcn `Card` + glass classes
- Replace custom category filter buttons with shadcn `ToggleGroup` (single-select)
- Use `Badge` or small `Card` for individual toolkit items

### 5. FooterSection (`src/components/FooterSection.tsx`)
- Already uses shadcn `Dialog` -- keep as-is
- Replace custom `FooterButton` with shadcn `Button` (variant="outline" or "ghost") with glass styling
- Use `Separator` between dialog content sections

### 6. Links Page (`src/pages/Links.tsx`)
- Replace `GlassContainer` with shadcn `Card` + glass classes
- Each link row uses shadcn `Button` (variant="ghost", asChild wrapping `<a>`)

### 7. NotFound Page (`src/pages/NotFound.tsx`)
- Wrap content in shadcn `Card` with glass styling
- Use `Button` for the "Return to Home" link

### 8. GlassContainer (`src/components/GlassContainer.tsx`)
- Keep as a thin wrapper but internally render a shadcn `Card` with glass class overrides applied
- This ensures all existing usages automatically get shadcn Card semantics

## What Stays the Same
- All CSS theme variables and glass utility classes in `index.css` (unchanged)
- `DotGridBackground` canvas component (no shadcn equivalent)
- `useMouseGlow`, `useScrollReveal`, `useTheme`, `useConfig` hooks (unchanged)
- Framer Motion scroll-reveal animations on sections
- All JSON config files and data-driven architecture

## Technical Details

### Glass + shadcn Card Pattern
```tsx
// Before
<GlassContainer className="space-y-4">...</GlassContainer>

// After (GlassContainer internally becomes)
<Card className="glass rounded-xl glow-container border-0 space-y-4">
  ...
</Card>
```

The shadcn Card's default `border` and `bg-card` are overridden by the `glass` utility class, which applies the custom `--glass-bg` and `--glass-border` variables.

### Navbar DropdownMenu Pattern
```tsx
// Theme switcher becomes:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="glass rounded-full">
      {currentTheme} <ChevronDown />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {themes.map(t => (
      <DropdownMenuItem onClick={() => setTheme(t.id)}>
        {t.label}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### Files Modified
- `src/components/GlassContainer.tsx` -- wrap shadcn Card
- `src/components/Navbar.tsx` -- DropdownMenu + Button
- `src/components/HeroSection.tsx` -- Card + Badge + Button
- `src/components/AboutSection.tsx` -- Card + Separator
- `src/components/ToolkitSection.tsx` -- Card + ToggleGroup
- `src/components/FooterSection.tsx` -- Button refinements
- `src/pages/Links.tsx` -- Card + Button
- `src/pages/NotFound.tsx` -- Card + Button
