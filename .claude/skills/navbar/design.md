# Navbar — Design Specification

Glass pill navbar design system. Implementation reference for the component in `SKILL.md`.

---

## 1. Anatomy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo.]       [Link] [Link ▾] [Link]       [🔍] [🔔] [☀] [CTA Button]     │
└──────────────────────────────────────────────────────────────────────────────┘
  Brand zone      Nav pill (desktop only)            Utility zone
```

**Brand zone** — Logo text with accent-color dot (`brand.`). Always links to `/`.
**Nav pill** — Horizontal link row in its own glassmorphic pill container. Hidden on mobile.
**Utility zone** — Search toggle, notification bell, theme toggle, mobile hamburger. Always visible.
**CTA button** — Required. Solid accent-color pill inside the nav pill. Right-anchored.

---

## 2. Visual Behavior

### 2.1 Bar → Pill morphing (default)

At page top (`scrollY ≤ 50`): full-width transparent bar.
After scrolling past 50px: morphs to a centered floating pill.

```
Top state:
  position: fixed; top: 0; left: 0; right: 0;
  width: 100%; height: 64px; padding: 0 40px;
  background: transparent; backdrop-filter: blur(0px);
  border: none; border-radius: 0;

Pill state:
  position: fixed; top: 12px; left: 0; right: 0; margin: 0 auto;
  width: min(720px, calc(100% - 32px)); height: 52px; padding: 0 24px;
  background: var(--nav-bg); backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border); border-radius: 26px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);

Transition:
  all 0.4s cubic-bezier(0.4, 0, 0.2, 1)  — applied on the background layer div
```

> The `border-radius: 26px` on the pill is intentional: `height/2 = 26`. This makes it a true stadium shape without rounding artifacts.

### 2.2 Scroll-hide (alternative)

When `features.scrollHide: true`, the pill morph is disabled. Instead:

```
Scroll down (scrollY > lastScrollY && scrollY > 80):
  transform: translateY(calc(-100% - 20px))   — hides fully above viewport + shadow

Scroll up:
  transform: translateY(0)

Transition:
  transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)
```

> The `> 80` guard prevents false triggers when the page first loads or bounces at the top.

---

## 3. Background Layer Architecture

**Critical implementation detail.** The backdrop-filter is NOT applied to the `<header>` element itself. It lives on a separate child `<div className="absolute inset-0 -z-10">`.

**Why:** In CSS, `backdrop-filter` creates a new stacking context. If the `<header>` itself has `backdrop-filter`, every child element that also has `backdrop-filter` (the nav pill container, the mobile dropdown) will only blur within the header's own layer — not the page content behind it. The blurs render wrong, or not at all.

**Solution:** The header is a transparent positioning container. A separate `z-index: -1` background div holds the blur. Child elements then float above it with their own independent blur stacking contexts.

```
<header>  ← no backdrop-filter, just positioning
  <div -z-10>  ← holds blur(24px), the pill background
  <nav>  ← has its own blur(12px) independently
    <span -z-10>  ← nav pill blur layer (same pattern, nested)
  <dropdown>  ← also has blur(24px), independent from header
```

---

## 4. Features — Design Specs

### 4.1 Active link indicator

A Framer Motion `layoutId="nav-active-pill"` `<motion.span>` positioned `absolute inset-0` behind the active link text. Animates via spring between links on route change.

```
Shape:    rounded-full (matches link padding shape)
Fill:     var(--glass-strong) + backdrop-filter: blur(20px)
Border:   1px solid var(--glass-border)
Spring:   stiffness 200, damping 28, mass 0.8
```

> Not rendered on links that have `children` (mega-menu parents) — they get highlighted via hover state instead.

### 4.2 CTA button (required)

Solid filled pill, last item inside the nav pill container.

```
Background:     var(--accent-purple)
Text:           white, font-weight: 600
Padding:        18px horizontal, 7px vertical
Border-radius:  9999px
Hover:          scale(1.05) + box-shadow: 0 4px 20px oklch(0.7 0.18 270 / 0.4)
Hover transition: all 200ms
Mobile:         full-width block inside the mobile dropdown, centered text
```

### 4.3 Mega-menu dropdown

Triggered by `onMouseEnter` on a link that has `children`. Dismissed on `onMouseLeave`.

```
Shape:        border-radius: 14px
Background:   var(--nav-bg) + backdrop-filter: blur(24px)
Border:       1px solid var(--glass-border)
Shadow:       0 8px 32px rgba(0,0,0,0.2)
Padding:      8px (inner container)
Position:     absolute, top: 100% of the link, centered (left: 50%, translateX(-50%))
Min width:    200px

Entry animation:
  initial:  opacity 0, y: +6px, scale 0.97
  animate:  opacity 1, y: 0,    scale 1.0
  duration: 180ms, ease: [0.4, 0, 0.2, 1]

Each child item:
  Padding:    12px horizontal, 8px vertical
  Radius:     border-radius: 12px
  Hover bg:   var(--glass)
  Hover text: var(--text-color)
  Resting text: var(--text-muted)
  Description: text-xs, var(--text-dim), margin-top: 2px

Mobile:
  Children rendered as indented items below the parent link (pl-8)
  Font size: text-xs, color: var(--text-dim)
  Staggered entrance delay: (parent_index + child_index + 1) × 40ms
```

### 4.4 Inline search bar

A search icon button in the utility zone. On desktop, clicking it:
1. Hides the nav links
2. Expands an inline `<input>` from `width: 0` to `width: 100%` in the center area
3. The icon swaps to an X (close)

```
Expand animation:
  initial: opacity 0, width: 0
  animate: opacity 1, width: 100%
  duration: 220ms, ease: [0.4, 0, 0.2, 1]

Input:
  Background: transparent (see-through to the header background)
  No border, no outline
  Placeholder: "Search..."
  Escape key: closes search

Mobile:
  Appears as a glassmorphic input row at the top of the mobile dropdown
  Container: var(--glass) bg + var(--glass-border) border + 12px radius
  Icon: Search at 14px, color: var(--text-muted)
```

### 4.5 Notification bell

An icon button in the utility zone, left of the theme toggle.

```
Icon:   Bell (lucide), 16px
Button: 36px × 36px, rounded-full, var(--glass) bg + var(--glass-border) border

Badge positioning: absolute, top-right of button
  transform: translate(+50%, -50%)  — anchors to corner

Badge — dot mode (notificationCount === 0):
  Size:       8px × 8px circle
  Background: var(--accent-purple)
  No text

Badge — count mode (notificationCount > 0):
  Size:       14px × 14px minimum (expands for 2 digits)
  Background: var(--accent-purple)
  Text:       white, 9px, font-weight: 700
  Max:        "9+" for counts above 9

aria-label updates to include count:
  "Notifications (3)" when count > 0
  "Notifications" otherwise
```

### 4.6 Theme toggle

Icon button cycling dark ↔ light. Shows `Sun` in dark mode, `Moon` in light mode.

```
Button: 36px × 36px, rounded-full
Style:  same as notification bell (var(--glass) + border)
Hover:  background → var(--glass-strong)
Icon:   16px, color: var(--text-color)
```

For multi-theme cycling (more than 2 themes), replace the toggle with a popover. See SKILL.md.

### 4.7 Mobile hamburger

Icon button visible only below `md` breakpoint (768px). `Menu` icon when closed, `X` icon when open.

```
Icon swap animation:
  Exit:  rotate to ±90°, opacity → 0
  Enter: rotate from ∓90°, opacity → 1
  Duration: 180ms, easeInOut
  AnimatePresence mode="wait" ensures exit completes before enter starts

Button:  overflow: hidden (clips the rotation at the edges)
```

### 4.8 Mobile dropdown

Floating below the header, anchored to the right edge. **Importantly: its width is decoupled from the header width**, so it doesn't change size when the pill transition fires.

```
Position:     absolute, top: 100%, right: 0, marginTop: 8px
Min-width:    200px (not 100% — decoupled from header)
Shape:        border-radius: 16px
Background:   var(--nav-bg) + backdrop-filter: blur(24px)
Border:       1px solid var(--glass-border)
Shadow:       0 8px 32px rgba(0,0,0,0.2)
Transform origin: top right

Container animation:
  initial: opacity 0, scale 0.92, y: -6px
  animate: opacity 1, scale 1.0, y: 0
  exit:    opacity 0, scale 0.92, y: -6px
  duration: 220ms

Link stagger:
  Each link: initial opacity 0, x: +8px → 0, opacity 1
  Delay: index × 40ms
  Duration: 180ms
```

---

## 5. Glassmorphism Formula

The same formula applies everywhere — header background, nav pill, buttons, dropdowns. Only the alpha and blur values differ by role.

```
              Background                        Blur    Border
──────────────────────────────────────────────────────────────────
Header pill   var(--nav-bg)                     24px    glass-border
Nav pill      var(--glass)                      12px    glass-border
Active pill   var(--glass-strong)               20px    glass-border
Buttons       var(--glass)                      12px    glass-border
Button hover  var(--glass-strong)               12px    glass-border
Dropdown      var(--nav-bg)                     24px    glass-border
Mega-menu     var(--nav-bg)                     24px    glass-border
Mobile input  var(--glass)                       —      glass-border
```

---

## 6. CSS Variables

### Required (per theme)

| Variable | Dark value | Light value | Role |
|---|---|---|---|
| `--nav-bg` | `rgba(15,16,40,0.65)` | `rgba(240,240,248,0.70)` | Header + dropdown background |
| `--glass` | `rgba(255,255,255,0.09)` | `rgba(255,255,255,0.55)` | Ghost elements |
| `--glass-strong` | `rgba(255,255,255,0.18)` | `rgba(255,255,255,0.70)` | Active / hover state |
| `--glass-border` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` | All borders |
| `--text-color` | `#f0f0f5` | `#1a1a2e` | Active text |
| `--text-muted` | `rgba(240,240,245,0.5)` | `rgba(26,26,46,0.55)` | Inactive links |
| `--text-dim` | `rgba(240,240,245,0.3)` | `rgba(26,26,46,0.3)` | Descriptions |
| `--accent-purple` | `oklch(0.7 0.18 270)` | `oklch(0.7 0.18 270)` | CTA, badges, dot |

### Optional (for light flash prevention)

```css
html { background-color: var(--bg1); }  /* prevents white flash before CSS loads */
body { background-color: var(--bg1); color: var(--text-color); }
```

---

## 7. Theme Adaptation

### Binary dark/light

Two `[data-theme]` blocks in your CSS (see CSS variables table above). Toggle via:
```ts
setTheme(theme === "dark" ? "light" : "dark");
document.documentElement.setAttribute("data-theme", newTheme);
localStorage.setItem("theme", newTheme);
```

Flash prevention (SSR + page load): inject a blocking `<script>` in `<head>` that reads localStorage and sets `data-theme` before any CSS renders.

### Multi-theme (N themes via data-theme)

1. Add a CSS block per theme: `[data-theme="nord"] { --nav-bg: ...; --glass: ...; ... }`
2. The component needs no changes — it only reads CSS variables.
3. Change the theme toggle from binary to a cycle or popover.
4. The `data-theme` attribute controls everything — no JS knows about specific themes.

**Glassmorphism tuning per theme:**
- **Dark themes** (nord, catppuccin-mocha): `--glass` alpha 0.06–0.10, blur 16–24px
- **Light themes** (latte, solarized-light): `--glass` alpha 0.50–0.65, blur 12–16px
- **Mid-contrast themes** (catppuccin-frappe): `--glass` alpha 0.12–0.18, blur 16–20px

---

## 8. Sizing & Spacing Tokens

```
Header height (top):    64px
Header height (pill):   52px
Pill top offset:        12px
Pill max width:         min(720px, calc(100% - 32px))
Pill padding:           0 24px
Bar padding:            0 40px (desktop), 0 16px (mobile)

Nav pill inner padding: 3px (creates the "floating links inside pill" gap)
Link padding:           12px horizontal, 6px vertical (px-3 py-1.5)
CTA padding:            18px horizontal, 7px vertical

Ghost button:           36px × 36px
Ghost button radius:    9999px
Icon size:              16px (all utility icons)

Mobile dropdown radius: 16px
Mega-menu radius:       14px
Mega-menu child radius: 12px

Active badge (dot):     8px × 8px
Active badge (count):   14px × 14px (min)
Badge text:             9px, font-weight: 700, capped at "9+"

Mobile breakpoint:      768px (md)
```

---

## 9. Scroll Behavior — Choosing pill vs. scroll-hide

| Factor | Pill | Scroll-hide |
|---|---|---|
| **Good for** | Portfolios, marketing sites | Apps, content-heavy pages |
| **At page top** | Full-width transparent bar — doesn't compete with hero | Full-width bar (same) |
| **On scroll** | Shrinks to centered pill, always visible | Slides up and hides completely |
| **User discoverability** | Always reachable | Reachable only on scroll-up |
| **Content area** | Pill floats over content (no height shift) | Full height freed when hidden |
| **Animation** | Smooth morph via CSS transition | Translate -Y via CSS transition |

---

## 10. Accessibility

```html
<header>
  <nav aria-label="Main navigation">
    <!-- desktop links -->
    <a aria-current="page">Active Link</a>
  </nav>

  <button aria-label="Toggle menu" aria-expanded={mobileOpen}>
    <!-- hamburger -->
  </button>

  <button aria-label="Notifications (3)">  <!-- count in aria-label -->
    <Bell aria-hidden="true" />
    <span aria-hidden="true">3</span>     <!-- badge is visual only -->
  </button>
</header>
```

**Keyboard:**
- `Tab` cycles all controls in DOM order
- `Escape` closes search input
- Mobile menu closes on route change (SPA navigation)
- Outside click closes mobile menu and mega-menus

**Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  /* The component uses inline style transitions — override them: */
  header, header * { transition: none !important; animation: none !important; }
}
```

---

## 11. Component API Reference

```ts
interface NavChild {
  label: string;
  href: string;
  description?: string;    // subtitle shown below label in mega-menu
}

interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];   // present → renders chevron + mega-menu dropdown
}

interface NavFeatures {
  pill?: boolean;              // default: true — morph to pill on scroll
  scrollHide?: boolean;        // default: false — hide on scroll down
  search?: boolean;            // default: false — show search icon
  notifications?: boolean;     // default: false — show bell icon
  notificationCount?: number;  // undefined=hidden, 0=dot, n=count, >9="9+"
}

interface NavConfig {
  logo?: string;               // text wordmark (rendered as "logo.")
  links: NavLink[];            // nav items
  cta: { label: string; href: string };  // required — solid button
  features?: NavFeatures;
  baseDomain?: string;         // required for subdomain routing
}

// Component props
interface NavbarProps {
  showLinks?: boolean;  // default: true — false = logo + utility only (for subdomains)
}
```

---

## 12. Audit Checklist

**Structure**
- [ ] `<header>` wraps everything
- [ ] `<nav aria-label="...">` present
- [ ] Logo links to `/`
- [ ] Hamburger has `aria-expanded` and `aria-label`

**Architecture**
- [ ] Background blur is on a `-z-10` child div, NOT on `<header>` itself
- [ ] Nav pill blur is on a `-z-10` child span, NOT on `<nav>` itself
- [ ] Mobile dropdown is positioned relative to `<header>`, not the nav pill

**Behavior**
- [ ] Active link correct for both `/exact` and `/sub/path` routes
- [ ] Mobile menu closes on outside click
- [ ] Mobile menu closes on route change
- [ ] Mega-menu dismisses on `onMouseLeave`
- [ ] Search closes on `Escape`
- [ ] Scroll listener uses `{ passive: true }` and is cleaned up on unmount
- [ ] RAF de-bounce on scroll handler

**Visual**
- [ ] Pill transition is smooth (no jump) at 50px scroll threshold
- [ ] Mobile dropdown width does NOT change during the pill transition
- [ ] Notification badge does not overflow button bounds
- [ ] CTA has hover scale + glow effect

**Accessibility**
- [ ] All icon buttons have `aria-label`
- [ ] Notification count reflected in `aria-label`
- [ ] Color contrast ≥ 4.5:1 on links (both themes)
- [ ] `prefers-reduced-motion` respected

**Theming**
- [ ] No hardcoded hex colors — all values via CSS vars
- [ ] Both dark and light modes tested
- [ ] No flash of wrong theme on load (blocking script in `<head>`)
