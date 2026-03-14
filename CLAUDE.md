# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Build for production (runs image optimization prebuild)
npm run build:dev    # Build in development mode
npm run lint         # ESLint check
npm run test         # Run tests once (vitest run)
npm run test:watch   # Run tests in watch mode (vitest)
```

Both `bun.lockb` and `package-lock.json` exist; use `npm install` for dependency management.

## Architecture

This is a **personal portfolio website** built with React 18 + TypeScript + Vite, featuring a multi-theme glassmorphism design and an MDX blog system.

### Stack

- **Vite** with React SWC plugin and a custom MDX plugin (in `vite.config.ts`) that extracts YAML frontmatter from `.mdx` files
- **Tailwind CSS 3** with shadcn/ui (Radix UI primitives) — configured via `components.json`, components live in `src/components/ui/`
- **React Router v6** with lazy-loaded pages and subdomain routing (`links.rsgametech.me`, `blogs.rsgametech.me`)
- **TanStack React Query** for async state management
- **Framer Motion** for scroll-reveal animations

### Path Alias

`@/` maps to `./src/` (configured in both `tsconfig.json` and `vite.config.ts`).

### Key Directories

- `src/pages/` — Route-level page components (Index, Blogs, BlogPost, Links, Projects, NotFound)
- `src/components/` — Reusable components; `ui/` subdirectory is shadcn/ui primitives
- `src/hooks/` — Custom hooks (useTheme, useConfig, useBlogPosts, useMouseGlow, useScrollReveal)
- `src/content/blogs/` — MDX blog post files with YAML frontmatter
- `public/config/` — JSON configuration files (navbar, hero, toolkit, footer, links) loaded at runtime via `useConfig` hook
- `scripts/` — Build scripts (e.g., `generateResponsiveImages.js` using sharp)

### Configuration-Driven Content

Content is managed through JSON files in `public/config/` rather than hardcoded. The `useConfig<T>(path, fallback)` hook fetches these at runtime. Files: `navbar.json`, `hero.json`, `toolkit.json`, `footer.json`, `links.json`.

### Theme System

8 themes defined as CSS custom properties in `src/index.css` (dark-minimal, minimal-light, nord, solarized, catppuccin-mocha/frappe/macchiato/latte). Managed by `useTheme` hook with localStorage persistence (`portfolio-theme` key). Sets `data-theme` attribute on document root.

### Glassmorphism Pattern

- `.glass` and `.glass-inner` utility classes in `src/index.css` use `backdrop-filter: blur()` with theme-variable backgrounds
- `GlassContainer` component wraps content with glass styling
- Mouse glow effect tracked by `useMouseGlow` hook, setting `--mx`/`--my` CSS variables for radial gradient positioning

### Blog/MDX System

1. MDX files in `src/content/blogs/` with frontmatter (title, date, description, tags, featuredImage)
2. Custom Vite plugin in `vite.config.ts` compiles MDX and exports frontmatter
3. `useBlogPosts` hook uses `import.meta.glob()` to discover and load posts
4. `scripts/generateResponsiveImages.js` creates 3 size variants (480/768/1200px) via sharp — runs automatically as prebuild step
5. `ResponsiveImage` component serves optimized variants with srcset fallback

### Page Structure Convention

Every page follows: `DotGridBackground` (fixed) → `Navbar` (fixed) → `main` (max-w-4xl centered, pt-[70px]) → `FooterSection`.

### TypeScript Config

Lenient settings: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`, `noUnusedParameters: false`.
