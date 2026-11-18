import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { animate, set, stagger, spring, type JSAnimation } from "animejs";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Menu } from "lucide-react";
import config from "@/config/navbar";

const NAV_SURFACE_RADIUS = 26;

// Spring-ish cubic-bezier for CSS-driven press/hover feedback (Apple damping ~1.0 feel)
const SPRING_BEZIER = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// Apple's perceived spring (WWDC 2023): bounce ↔ damping, response ↔ duration.
// Velocity handoff needs stiffness/damping mode — the bounce+duration mode
// forces velocity back to 0, so we derive s/d from the same formulas.
const menuSpring = (velocity = 0) => {
  const response = 0.32;
  const bounce = 0.15;
  if (Math.abs(velocity) < 0.05) return spring({ bounce, duration: response * 1000 });
  const stiffness = Math.pow((2 * Math.PI) / response, 2);
  const damping = ((1 - bounce) * 4 * Math.PI) / response;
  return spring({ stiffness, damping, velocity });
};

// Critically damped fade for the icon and menu items — content never overshoots
const fadeSpring = (duration: number) => spring({ bounce: 0, duration });

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isSubdomain =
  typeof window !== "undefined" &&
  window.location.hostname !== "rsgametech.me" &&
  window.location.hostname !== "localhost";

function resolveHref(href: string) {
  if (isSubdomain && href.startsWith("/")) return `https://rsgametech.me${href}`;
  return href;
}

const Navbar = ({ showLinks = true }: { showLinks?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const rafRef = useRef<number | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuAnimReady = useRef(false);
  const panelAnimRef = useRef<JSAnimation | null>(null);
  const itemsAnimRef = useRef<JSAnimation | null>(null);
  const btnAnimRef = useRef<JSAnimation | null>(null);
  // Panel rect at rest (mid-flight it's transformed, so FLIP must not measure it)
  const naturalRef = useRef<DOMRect | null>(null);
  const atRestRef = useRef(true);
  // Presentation velocity of the panel in px/s — handed to the spring on reversal
  const velRef = useRef({ t: 0, top: 0, vy: 0 });
  const location = useLocation();

  // Scroll → pill transition
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        rafRef.current = null;
      });
    };

    const onResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Close the menu on outside clicks. The hamburger is itself a toggle, so
  // it's excluded — otherwise mousedown would close and the subsequent click
  // would immediately reopen.
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (hamburgerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  // Single-pill measurement — X-only so scroll position never contaminates the animation
  const navRef = useRef<HTMLElement>(null);
  const linkSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pillRef = useRef<HTMLSpanElement>(null);
  const pillInitialized = useRef(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const nav = navRef.current;
      const activeIdx = config.links.findIndex((l) => isActive(l.href));
      const span = linkSpanRefs.current[activeIdx];
      if (!nav || !span) { setPill(null); return; }
      const nr = nav.getBoundingClientRect();
      const sr = span.getBoundingClientRect();
      const borderLeft = parseFloat(getComputedStyle(nav).borderLeftWidth) || 0;
      setPill({ x: sr.left - nr.left - borderLeft, w: sr.width });
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Slide the active-link pill. First appearance jumps into place (no animation),
  // subsequent route changes spring across with a back-out ease.
  useEffect(() => {
    if (!pill || !pillRef.current) return;
    if (!pillInitialized.current) {
      set(pillRef.current, { x: pill.x, width: pill.w });
      pillInitialized.current = true;
    } else {
      animate(pillRef.current, {
        x: pill.x,
        width: pill.w,
        duration: 500,
        ease: "outBack(1.6)",
      });
    }
  }, [pill]);

  // Sample the panel's on-screen velocity (px/s) each frame so a mid-flight
  // reversal can hand it to the next spring instead of stopping dead
  const trackPanelVelocity = () => {
    const panel = dropdownRef.current;
    if (!panel) return;
    const now = performance.now();
    const top = panel.getBoundingClientRect().top;
    const dt = (now - velRef.current.t) / 1000;
    if (dt < 0.004) return;
    velRef.current = { t: now, top, vy: (top - velRef.current.top) / dt };
  };

  // iOS-style expand: the panel FLIPs out of the hamburger button's rect
  // while the icon fades away — the icon *becomes* the panel. All motion runs
  // on Apple-style perceived springs; a reversal mid-flight inherits the live
  // velocity, and enter/exit share the same path and curve.
  useEffect(() => {
    const panel = dropdownRef.current;
    const btn = hamburgerRef.current;
    if (!panel || !btn) return;

    if (!menuAnimReady.current) {
      menuAnimReady.current = true;
      naturalRef.current = panel.getBoundingClientRect();
      set(panel, { opacity: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 });
      set(panel.querySelectorAll<HTMLElement>("[data-menu-item]"), { opacity: 0, y: -4 });
      panel.style.visibility = "hidden";
      return;
    }

    const items = panel.querySelectorAll<HTMLElement>("[data-menu-item]");

    // Consume the presentation velocity of the animation being interrupted
    const vy = velRef.current.vy;

    panelAnimRef.current?.cancel();
    itemsAnimRef.current?.cancel();
    btnAnimRef.current?.cancel();

    // Only trustworthy while at rest — mid-flight the rect is transformed
    if (atRestRef.current) naturalRef.current = panel.getBoundingClientRect();
    const natural = naturalRef.current!;

    const h = btn.getBoundingClientRect();
    const flip = {
      x: h.right - natural.right,
      y: h.top - natural.top,
      scaleX: natural.width ? h.width / natural.width : 1,
      scaleY: natural.height ? h.height / natural.height : 1,
    };

    if (prefersReducedMotion()) {
      panel.style.visibility = mobileOpen ? "visible" : "hidden";
      set(panel, { opacity: mobileOpen ? 1 : 0, x: 0, y: 0, scaleX: 1, scaleY: 1 });
      set(btn, { opacity: mobileOpen ? 0 : 1 });
      set(items, { opacity: 1, y: 0 });
      return;
    }

    // Progress-rate for the new spring: physical px/s ÷ remaining span.
    // Sign falls out naturally (close span is negative → reversal keeps moving
    // away from the new target first, then settles in).
    const springForReversal = (toTop: number, fromTop: number) => {
      const span = toTop - fromTop;
      if (Math.abs(span) < 1) return menuSpring(0);
      const raw = vy / span;
      return menuSpring(Math.max(-8, Math.min(8, raw)));
    };

    if (mobileOpen) {
      panel.style.visibility = "visible";
      if (atRestRef.current) set(panel, { ...flip, opacity: 0 });
      atRestRef.current = false;

      const fromTop = panel.getBoundingClientRect().top;
      const toTop = natural.top;
      velRef.current = { t: performance.now(), top: fromTop, vy: 0 };

      panelAnimRef.current = animate(panel, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        ease: springForReversal(toTop, fromTop),
        onUpdate: trackPanelVelocity,
        onComplete: () => {
          atRestRef.current = true;
          velRef.current.vy = 0;
          naturalRef.current = panel.getBoundingClientRect();
        },
      });
      btnAnimRef.current = animate(btn, { opacity: 0, ease: fadeSpring(200) });
      itemsAnimRef.current = animate(items, {
        opacity: 1,
        y: 0,
        delay: stagger(30),
        ease: fadeSpring(250),
      });
    } else {
      atRestRef.current = false;

      const fromTop = panel.getBoundingClientRect().top;
      const toTop = natural.top + flip.y;
      velRef.current = { t: performance.now(), top: fromTop, vy: 0 };

      // Icon returns only as the panel retracts into its place
      btnAnimRef.current = animate(btn, { opacity: 1, delay: 120, ease: fadeSpring(250) });
      panelAnimRef.current = animate(panel, {
        ...flip,
        opacity: 0,
        ease: springForReversal(toTop, fromTop),
        onUpdate: trackPanelVelocity,
        onComplete: () => {
          panel.style.visibility = "hidden";
          set(panel, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
          set(items, { opacity: 0, y: -4 });
          atRestRef.current = true;
          velRef.current.vy = 0;
          naturalRef.current = panel.getBoundingClientRect();
        },
      });
    }
  }, [mobileOpen]);

  useEffect(() => () => {
    panelAnimRef.current?.cancel();
    itemsAnimRef.current?.cancel();
    btnAnimRef.current?.cancel();
  }, []);

  const isPill = scrolled;

  const headerStyle: React.CSSProperties = {
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    margin: "0 auto",
    left: 0,
    right: 0,
    // `viewport-fit=cover` lets the page paint under the iOS notch/status bar,
    // so the nav has to offset itself by the top safe-area inset (0 elsewhere).
    ...(isPill
      ? {
          top: "calc(12px + env(safe-area-inset-top))",
          width: "min(1000px, calc(100% - 32px))",
          height: 52,
          padding: "0 24px",
        }
      : {
          top: 0,
          // Desktop keeps the floating width + padding constant so the bar ↔ pill
          // morph never shifts the inner UI; mobile reverts to the full-width bar.
          width: isMobile ? "100%" : "min(1000px, calc(100% - 32px))",
          height: "calc(64px + env(safe-area-inset-top))",
          padding: isMobile ? "0 40px" : "0 24px",
          // Must follow the `padding` shorthand — React applies style keys in
          // insertion order, so the shorthand would otherwise reset this to 0.
          paddingTop: "env(safe-area-inset-top)",
        }),
  };

  const logo = config.logo || "ritam";

  return (
    <header
      ref={mobileMenuRef}
      className="fixed z-50 flex items-center justify-between"
      style={headerStyle}
    >
      {/* Background layer for smooth transitions independent of dropdown blur */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: isPill ? NAV_SURFACE_RADIUS : 0,
          background: isPill ? "var(--nav-bg)" : "transparent",
          backdropFilter: isPill ? "blur(24px)" : "blur(0px)",
          WebkitBackdropFilter: isPill ? "blur(24px)" : "blur(0px)",
          border: isPill ? "1px solid var(--glass-border)" : "1px solid transparent",
          boxShadow: isPill ? "0 8px 32px rgba(0,0,0,0.2)" : "none",
        }}
      />

      {/* Logo */}
      <Link
        to="/"
        className="font-bold text-lg tracking-tight select-none"
        style={{ color: "var(--text-color)", letterSpacing: "-0.5px" }}
      >
        {logo}
        <span style={{ color: "var(--accent-purple)" }}>.</span>
      </Link>

      {/* Desktop nav */}
      {showLinks && (
        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-1 p-[3px] rounded-full relative"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          {/* Nav blur backdrop — separate layer so the pill's own backdrop-filter works */}
          <span
            className="absolute inset-0 rounded-full -z-10"
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />

          {/* Single pill — only x/width animate, y is fixed in style to avoid scroll drift */}
          {pill && (
            <span
              ref={pillRef}
              className="absolute rounded-full pointer-events-none"
              style={{
                top: 3,
                bottom: 3,
                left: 0,
                background: "var(--glass-strong)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)",
              }}
            />
          )}

          {config.links.map((link, i) => {
            const active = isActive(link.href);
            const href = resolveHref(link.href);
            const isExternal = isSubdomain && link.href.startsWith("/");

            return (
              <span
                key={link.label}
                ref={(el) => { linkSpanRefs.current[i] = el; }}
                className="relative inline-block"
              >
                {isExternal ? (
                  <a
                    href={href}
                    className="relative z-10 block text-sm font-medium rounded-full px-3 py-1.5 transition-[color,transform] duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{ color: active ? "var(--text-color)" : "var(--text-muted)", transitionTimingFunction: SPRING_BEZIER }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-color)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="relative z-10 block text-sm font-medium rounded-full px-3 py-1.5 transition-[color,transform] duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{ color: active ? "var(--text-color)" : "var(--text-muted)", transitionTimingFunction: SPRING_BEZIER }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-color)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            );
          })}
          {config.cta && (
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
          )}
        </nav>
      )}

      {/* Menu group — hamburger + dropdown panel, panel springs from top-right */}
      <div className="relative flex items-center">
        {/* Hamburger stays the Menu icon always — press-scale only */}
        <button
          ref={hamburgerRef}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          tabIndex={mobileOpen ? -1 : 0}
          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-100 hover:scale-[1.03] active:scale-[0.97] ${mobileOpen ? "pointer-events-none" : ""}`}
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-color)",
            transitionTimingFunction: SPRING_BEZIER,
          }}
        >
          <span className="flex items-center justify-center">
            <Menu size={16} />
          </span>
        </button>

        {/* Menu panel — springs down from the trigger; links on mobile only,
            theme slider always at the bottom. Always mounted so anime can
            interrupt/re-target; visibility is driven by the animation effect. */}
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 flex flex-col overflow-hidden"
          style={{
            transformOrigin: "top right",
            minWidth: 200,
            marginTop: 8,
            // Concentric with the theme pill inside: pill radius 20 (rounded-full,
            // 40px tall) + 16px offset from the panel edge (px-4 wrapper)
            borderRadius: 36,
            background: "var(--nav-bg)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--glass-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            padding: "8px 0",
            opacity: 0,
            visibility: "hidden",
            willChange: "transform, opacity",
          }}
        >
          {showLinks && (
            <div className="md:hidden">
              {config.links.map((link) => {
                const active = isActive(link.href);
                const href = resolveHref(link.href);
                const isExternal = isSubdomain && link.href.startsWith("/");
                const linkStyle: React.CSSProperties = {
                  color: active ? "var(--text-color)" : "var(--text-muted)",
                };
                const className = "block px-5 py-2.5 text-sm font-medium transition-colors duration-200";
                return (
                  <div key={link.label} data-menu-item>
                    {isExternal ? (
                      <a href={href} className={className} style={linkStyle}>
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className={className} style={linkStyle}>
                        {link.label}
                      </Link>
                    )}
                  </div>
                );
              })}
              {config.cta && (
                <div className="px-4 pt-2 pb-1" data-menu-item>
                  <a
                    href={resolveHref(config.cta.href)}
                    className="block text-center text-sm font-semibold text-white rounded-full py-2 transition-all duration-200"
                    style={{ background: "var(--accent-purple)" }}
                  >
                    {config.cta.label}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Theme slider — pill group shaped like the desktop nav buttons.
              pb-2 + panel's 8px bottom pad = 16px, matching left/right/top */}
          <div className="px-4 pt-2 pb-2" data-menu-item>
            <div
              role="group"
              aria-label="Theme"
              className="relative flex items-center p-[3px] rounded-full"
              style={{
                border: "1px solid var(--glass-border)",
                background: "var(--glass)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute top-[3px] bottom-[3px] left-[3px] rounded-full"
                style={{
                  width: "calc((100% - 6px) / 2)",
                  transform: theme === "dark" ? "translateX(100%)" : "translateX(0)",
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: "var(--glass-strong)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid var(--glass-border)",
                }}
              />
              {(["light", "dark"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  aria-pressed={theme === id}
                  className="relative z-10 flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-full px-2 py-1.5 transition-colors duration-200"
                  style={{ color: theme === id ? "var(--text-color)" : "var(--text-muted)" }}
                >
                  {id === "light" ? <Sun size={14} /> : <Moon size={14} />}
                  {id === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
