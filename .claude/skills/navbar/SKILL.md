---
name: navbar
description: Build a glassmorphism navbar with scroll-aware pill transition, Framer Motion animated active states, mega-menu, inline search, notification bell, and scroll-hide. React/TypeScript reference implementation with adapters for Next.js and Vue.
triggers:
  - /navbar
  - "build a navbar"
  - "add a navbar"
  - "create navbar"
  - "navbar component"
  - "glassmorphism navbar"
---

# Navbar — Glass Pill Navbar Skill

A complete glassmorphism navbar for React + TypeScript projects. Features:
- **Bar → pill morphing** on scroll (or **scroll-hide** as an alternative)
- **Framer Motion `layoutId` active indicator** that slides between links
- **Config-driven** links, CTA, and feature flags via JSON
- **Mega-menu dropdown** for links with sub-pages
- **Inline search bar** that expands/collapses in place
- **Notification bell** with dot/count badge
- **Animated hamburger ↔ X** icon swap for mobile
- **Staggered mobile dropdown** with optional search
- **Subdomain routing** — resolves `/path` → `https://yourdomain.com/path` when on a subdomain

---

## Stack

| Package | Purpose |
|---|---|
| `react` + `typescript` | Core |
| `framer-motion` | Active pill animation, mobile menu, mega-menu |
| `react-router-dom` v6 | `Link`, `useLocation` for active detection |
| `lucide-react` | Icons (Sun, Moon, Menu, X, Search, Bell, ChevronDown) |
| Tailwind CSS + CSS custom properties | Styling + theming |

---

## 1. Install dependencies

```bash
npm install framer-motion lucide-react
```

React Router is assumed to already be installed. For Next.js see the **Adapter** section.

---

## 2. Define required CSS variables

Define these in your global CSS (inside your theme selector, e.g. `[data-theme="dark"]`):

```css
/* Dark theme */
:root, [data-theme="dark"] {
  --nav-bg:        rgba(15, 16, 40, 0.65);    /* pill/bar background */
  --glass:         rgba(255, 255, 255, 0.09); /* ghost buttons, nav container */
  --glass-strong:  rgba(255, 255, 255, 0.18); /* active pill fill */
  --glass-border:  rgba(255, 255, 255, 0.1);  /* all borders */
  --text-color:    #f0f0f5;
  --text-muted:    rgba(240, 240, 245, 0.5);
  --text-dim:      rgba(240, 240, 245, 0.3);  /* mega-menu descriptions */
  --accent-purple: oklch(0.7 0.18 270);       /* CTA + notification badge */
}

/* Light theme */
[data-theme="light"] {
  --nav-bg:        rgba(240, 240, 248, 0.70);
  --glass:         rgba(255, 255, 255, 0.55);
  --glass-strong:  rgba(255, 255, 255, 0.70);
  --glass-border:  rgba(0, 0, 0, 0.08);
  --text-color:    #1a1a2e;
  --text-muted:    rgba(26, 26, 46, 0.55);
  --text-dim:      rgba(26, 26, 46, 0.3);
  --accent-purple: oklch(0.7 0.18 270);
}
```

> For multi-theme systems (more than 2 themes), see **Theme Adaptation** at the bottom.

---

## 3. Define config JSON

Create `public/config/navbar.json`. All fields except `links` and `cta` are optional:

```json
{
  "logo": "brand",
  "baseDomain": "yourdomain.com",
  "links": [
    { "label": "Projects",  "href": "/projects" },
    { "label": "Blog",      "href": "/blogs" },
    {
      "label": "Work",
      "href": "/work",
      "children": [
        { "label": "Case Studies", "href": "/work/cases",  "description": "Deep dives into past projects" },
        { "label": "Open Source",  "href": "/work/oss",    "description": "What I build in public" }
      ]
    }
  ],
  "cta": { "label": "Hire me", "href": "/contact" },
  "features": {
    "pill":              true,
    "scrollHide":        false,
    "search":            false,
    "notifications":     false,
    "notificationCount": 0
  }
}
```

> `pill` and `scrollHide` are mutually exclusive. If `scrollHide: true`, pill is ignored.
> `notificationCount`: `undefined` = no badge, `0` = dot, `>0` = number (capped at "9+").

---

## 4. Create the component

Drop this file at `src/components/Navbar.tsx` (or equivalent). Replace `useConfig` and `useTheme` with your project's equivalents — see the inline comments.

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/hooks/useConfig"; // swap for your config loader
import { useTheme } from "@/hooks/useTheme";   // swap for your theme hook
import { Sun, Moon, Menu, X, Search, Bell, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
  description?: string;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
}

interface NavFeatures {
  search?: boolean;
  notifications?: boolean;
  notificationCount?: number;
  scrollHide?: boolean;
  pill?: boolean;
}

interface NavConfig {
  logo?: string;
  links: NavLink[];
  cta: { label: string; href: string };
  features?: NavFeatures;
  baseDomain?: string;
}

// ─── Subdomain helper ─────────────────────────────────────────────────────────

function makeSubdomainHelpers(baseDomain: string) {
  if (typeof window === "undefined") return { isSubdomain: false, resolveHref: (h: string) => h };
  const hostname = window.location.hostname;
  const isSubdomain =
    hostname !== baseDomain && hostname !== "localhost" && hostname !== "127.0.0.1";
  const resolveHref = (href: string) =>
    isSubdomain && href.startsWith("/") ? `https://${baseDomain}${href}` : href;
  return { isSubdomain, resolveHref };
}

// ─── Component ────────────────────────────────────────────────────────────────

const Navbar = ({ showLinks = true }: { showLinks?: boolean }) => {
  const { data: config } = useConfig<NavConfig>("/config/navbar.json", {
    links: [],
    cta: { label: "Contact", href: "/contact" },
  });
  const { theme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const features = config.features ?? {};
  const usePill = !features.scrollHide && features.pill !== false;
  const { isSubdomain, resolveHref } = makeSubdomainHelpers(config.baseDomain ?? "yourdomain.com");

  // ── Scroll: pill morph or scroll-hide ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 50);
        if (features.scrollHide) {
          setScrollHidden(y > lastScrollY.current && y > 80);
        }
        lastScrollY.current = y;
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [features.scrollHide]);

  // ── Close mobile menu on outside click ────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node))
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // ── Close everything on route change ──────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // ── Autofocus search input ─────────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const isPill = usePill && scrolled;

  const headerStyle: React.CSSProperties = {
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: scrollHidden ? "translateY(calc(-100% - 20px))" : "translateY(0)",
    margin: "0 auto",
    left: 0,
    right: 0,
    ...(isPill
      ? { top: 12, width: "min(720px, calc(100% - 32px))", height: 52, padding: "0 24px" }
      : { top: 0, width: "100%", height: 64, padding: "0 40px" }),
  };

  const logo = config.logo ?? "brand";

  return (
    <header
      ref={mobileMenuRef}
      className="fixed z-50 flex items-center justify-between"
      style={headerStyle}
    >
      {/*
        Background layer — MUST be a separate child div, not applied to the header itself.
        Reason: if backdrop-filter is on the header, any child with its own backdrop-filter
        (the nav pill, the mobile dropdown) will not blur correctly — each stacking context
        clips its own blur to its own bounds. The separate div is z-index: -1, so dropdowns
        float above it unaffected.
      */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: isPill ? 26 : 0,
          background: isPill ? "var(--nav-bg)" : "transparent",
          backdropFilter: isPill ? "blur(24px)" : "blur(0px)",
          WebkitBackdropFilter: isPill ? "blur(24px)" : "blur(0px)",
          border: isPill ? "1px solid var(--glass-border)" : "1px solid transparent",
          boxShadow: isPill ? "0 8px 32px rgba(0,0,0,0.2)" : "none",
        }}
      />

      {/* ── Logo ── */}
      <Link
        to="/"
        className="font-bold text-lg tracking-tight select-none shrink-0"
        style={{ color: "var(--text-color)", letterSpacing: "-0.5px" }}
      >
        {logo}
        <span style={{ color: "var(--accent-purple)" }}>.</span>
      </Link>

      {/* ── Desktop inline search (replaces nav links when open) ── */}
      <AnimatePresence>
        {searchOpen && features.search && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="mx-4 hidden md:flex items-center overflow-hidden"
          >
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: "var(--text-color)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop nav links ── */}
      {showLinks && !searchOpen && (
        <nav
          className="hidden md:flex items-center gap-1 p-[3px] rounded-full relative"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          {/*
            Nav blur layer — also must be a separate pseudo-element/child, not on the <nav>
            itself. Same stacking-context reason as the header background layer.
          */}
          <span
            className="absolute inset-0 rounded-full -z-10"
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />

          {config.links.map((link) => {
            const active = isActive(link.href);
            const href = resolveHref(link.href);
            const isExternal = isSubdomain && link.href.startsWith("/");
            const hasChildren = (link.children?.length ?? 0) > 0;

            const sharedLinkProps = {
              className:
                "relative z-10 flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 transition-colors duration-200",
              style: { color: active ? "var(--text-color)" : "var(--text-muted)" } as React.CSSProperties,
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                if (!active) e.currentTarget.style.color = "var(--text-color)";
              },
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                if (!active) e.currentTarget.style.color = "var(--text-muted)";
              },
            };

            return (
              <span
                key={link.label}
                className="relative inline-block"
                onMouseEnter={() => hasChildren && setActiveDropdown(link.label)}
                onMouseLeave={() => hasChildren && setActiveDropdown(null)}
              >
                {/* Animated active pill — only on links without children */}
                {active && !hasChildren && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "var(--glass-strong)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid var(--glass-border)",
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 28, mass: 0.8 }}
                  />
                )}

                {isExternal ? (
                  <a href={href} {...sharedLinkProps}>
                    {link.label}
                    {hasChildren && <ChevronDown size={12} />}
                  </a>
                ) : (
                  <Link to={link.href} {...sharedLinkProps}>
                    {link.label}
                    {hasChildren && <ChevronDown size={12} />}
                  </Link>
                )}

                {/* ── Mega-menu dropdown ── */}
                <AnimatePresence>
                  {hasChildren && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] z-50"
                      style={{
                        borderRadius: 14,
                        background: "var(--nav-bg)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid var(--glass-border)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        padding: "8px",
                      }}
                    >
                      {link.children!.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block rounded-xl px-3 py-2 transition-colors duration-150"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--text-color)";
                            e.currentTarget.style.background = "var(--glass)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span className="block text-sm font-medium">{child.label}</span>
                          {child.description && (
                            <span className="block text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
            );
          })}

          {/* ── CTA button (required) ── */}
          <a
            href={resolveHref(config.cta.href)}
            className="text-sm font-semibold text-white rounded-full px-[18px] py-[7px] transition-all duration-200"
            style={{ background: "var(--accent-purple)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 20px oklch(0.7 0.18 270 / 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {config.cta.label}
          </a>
        </nav>
      )}

      {/* ── Right controls ── */}
      <div className="flex items-center gap-2">

        {/* Search toggle (desktop only) */}
        {features.search && (
          <button
            onClick={() => { setSearchOpen((o) => !o); setSearchQuery(""); }}
            aria-label="Toggle search"
            className="w-9 h-9 rounded-full hidden md:flex items-center justify-center transition-all duration-200"
            style={{
              background: searchOpen ? "var(--glass-strong)" : "var(--glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-color)",
            }}
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>
        )}

        {/* Notification bell */}
        {features.notifications && (
          <button
            aria-label={
              features.notificationCount
                ? `Notifications (${features.notificationCount})`
                : "Notifications"
            }
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 relative"
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-color)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-strong)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--glass)")}
          >
            <Bell size={16} />
            {features.notificationCount !== undefined && (
              <span
                aria-hidden="true"
                className="absolute flex items-center justify-center text-white font-bold pointer-events-none"
                style={{
                  background: "var(--accent-purple)",
                  borderRadius: 99,
                  top: 6,
                  right: 6,
                  minWidth: features.notificationCount > 0 ? 14 : 8,
                  height: features.notificationCount > 0 ? 14 : 8,
                  fontSize: 9,
                  lineHeight: 1,
                  transform: "translate(50%, -50%)",
                }}
              >
                {features.notificationCount > 0
                  ? features.notificationCount > 9
                    ? "9+"
                    : features.notificationCount
                  : ""}
              </span>
            )}
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-color)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-strong)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--glass)")}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Mobile hamburger */}
        {showLinks && (
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 relative overflow-hidden"
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-color)",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ rotate: mobileOpen ? -90 : 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: mobileOpen ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && showLinks && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full md:hidden flex flex-col"
            style={{
              transformOrigin: "top right",
              right: 0,
              minWidth: 200,
              marginTop: 8,
              borderRadius: 16,
              background: "var(--nav-bg)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              padding: "8px 0",
            }}
          >
            {/* Mobile search */}
            {features.search && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="px-4 pb-2 pt-1"
              >
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                >
                  <Search size={14} style={{ color: "var(--text-muted)" }} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent outline-none text-sm flex-1"
                    style={{ color: "var(--text-color)" }}
                  />
                </div>
              </motion.div>
            )}

            {config.links.map((link, i) => {
              const active = isActive(link.href);
              const href = resolveHref(link.href);
              const isExternal = isSubdomain && link.href.startsWith("/");
              const linkStyle: React.CSSProperties = {
                color: active ? "var(--text-color)" : "var(--text-muted)",
              };
              const cls = "block px-5 py-2.5 text-sm font-medium transition-colors duration-200";

              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.18, ease: "easeOut" }}
                >
                  {isExternal ? (
                    <a href={href} className={cls} style={linkStyle}>{link.label}</a>
                  ) : (
                    <Link to={link.href} className={cls} style={linkStyle}>{link.label}</Link>
                  )}

                  {/* Mega-menu children on mobile (indented) */}
                  {link.children?.map((child, j) => (
                    <motion.div
                      key={child.href}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (i + j + 1) * 0.04, duration: 0.18 }}
                    >
                      <Link
                        to={child.href}
                        className="block pl-8 pr-5 py-2 text-xs font-medium transition-colors duration-200"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {child.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              );
            })}

            {/* CTA (required) */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: config.links.length * 0.04, duration: 0.18 }}
              className="px-4 pt-2 pb-1"
            >
              <a
                href={resolveHref(config.cta.href)}
                className="block text-center text-sm font-semibold text-white rounded-full py-2 transition-all duration-200"
                style={{ background: "var(--accent-purple)" }}
              >
                {config.cta.label}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
```

---

## 5. Usage

```tsx
// Page layout
<>
  <Navbar />
  <main className="pt-16">   {/* pt-16 = 64px, matches navbar height */}
    {children}
  </main>
</>

// Subdomain page — no links, just logo + theme toggle
<Navbar showLinks={false} />
```

---

## Adapter: Next.js App Router

Changes needed from the template above:

```tsx
"use client"; // add at top of file

// Replace react-router imports:
import Link from "next/link";
import { usePathname } from "next/navigation";

// Replace useLocation:
const pathname = usePathname();

// Replace isActive:
const isActive = (href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

// Replace useEffect route-change cleanup with:
// (not needed — Next.js App Router re-mounts the component on navigation)
```

SSR flash prevention — add to `app/layout.tsx` `<head>`:
```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    var t = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  })();
`}} />
```

---

## Adapter: Vue 3 (Composition API)

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';

const route = useRoute();
const scrolled = ref(false);
const mobileOpen = ref(false);

const isActive = (href: string) =>
  href === '/' ? route.path === '/' : route.path.startsWith(href);

const onScroll = () => { scrolled.value = window.scrollY > 50; };
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
watch(() => route.path, () => { mobileOpen.value = false; });
</script>
```

Use `<Transition name="fade">` / `<TransitionGroup>` for animations instead of Framer Motion.

---

## Adapter: No config file (inline config)

If your project doesn't have a `useConfig` hook, replace it with a static object:

```tsx
// Remove: import { useConfig } from "@/hooks/useConfig";
// Replace the hook call with:
const config: NavConfig = {
  logo: "brand",
  baseDomain: "yourdomain.com",
  links: [
    { label: "About",    href: "/about" },
    { label: "Projects", href: "/projects" },
  ],
  cta: { label: "Contact", href: "/contact" },
  features: { pill: true },
};
```

---

## Theme Adaptation

### Binary dark/light (default)

The component calls `setTheme(theme === "dark" ? "light" : "dark")`. The `useTheme` hook must:
- Return `{ theme: string, setTheme: (t: string) => void }`
- Persist to localStorage
- Set `data-theme` attribute on `document.documentElement`

### Multi-theme (more than 2 themes)

Replace the binary toggle button with a cycle or dropdown:

```tsx
const THEMES = ["dark", "light", "nord", "solarized"];
const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
// button onClick: setTheme(nextTheme)
// Or render a <select> / popover with all options
```

Each theme needs its own CSS variable block:
```css
[data-theme="nord"] {
  --nav-bg:       rgba(46, 52, 64, 0.75);
  --glass:        rgba(255, 255, 255, 0.06);
  --glass-strong: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.08);
  --text-color:   #eceff4;
  --text-muted:   rgba(236, 239, 244, 0.5);
  --text-dim:     rgba(236, 239, 244, 0.3);
  --accent-purple: #88c0d0;
}
```

---

## Feature flags reference

| Config key | Type | Default | Effect |
|---|---|---|---|
| `features.pill` | boolean | `true` | Morph header to centered pill on scroll |
| `features.scrollHide` | boolean | `false` | Hide on scroll-down, show on scroll-up. Overrides `pill`. |
| `features.search` | boolean | `false` | Show search icon button; desktop expands inline, mobile adds search input to dropdown |
| `features.notifications` | boolean | `false` | Show bell icon |
| `features.notificationCount` | number \| undefined | `undefined` | `undefined` = no badge, `0` = dot only, `>0` = count (capped at "9+") |

---

## CSS variables reference

| Variable | Used for |
|---|---|
| `--nav-bg` | Header pill background + mobile dropdown background |
| `--glass` | Nav pill container bg, ghost buttons bg |
| `--glass-strong` | Active link pill fill, ghost button hover bg |
| `--glass-border` | All borders (header, nav pill, buttons, dropdown) |
| `--text-color` | Active link text, logo, inputs |
| `--text-muted` | Inactive link text |
| `--text-dim` | Mega-menu child descriptions, mobile nested links |
| `--accent-purple` | CTA button bg, notification badge, logo dot |
