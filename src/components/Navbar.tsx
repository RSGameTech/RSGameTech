import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Menu, X } from "lucide-react";
import config from "@/config/navbar";

const NAV_SURFACE_RADIUS = 26;

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

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
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

  const isPill = scrolled;

  const headerStyle: React.CSSProperties = {
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    margin: "0 auto",
    left: 0,
    right: 0,
    ...(isPill
      ? {
          top: 12,
          width: "min(1000px, calc(100% - 32px))",
          height: 52,
          padding: "0 24px",
        }
      : {
          top: 0,
          width: "100%",
          height: 64,
          padding: "0 40px",
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
            <motion.span
              className="absolute rounded-full pointer-events-none"
              animate={{ x: pill.x, width: pill.w }}
              initial={false}
              transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.9 }}
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
                    className="relative z-10 block text-sm font-medium rounded-full px-3 py-1.5 transition-colors duration-200"
                    style={{ color: active ? "var(--text-color)" : "var(--text-muted)" }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-color)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="relative z-10 block text-sm font-medium rounded-full px-3 py-1.5 transition-colors duration-200"
                    style={{ color: active ? "var(--text-color)" : "var(--text-muted)" }}
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

      {/* Right controls */}
      <div className="flex items-center gap-2">
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

      {/* Mobile dropdown — always floating, never changes width on scroll */}
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
              minWidth: 180,
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
            {config.links.map((link, i) => {
              const active = isActive(link.href);
              const href = resolveHref(link.href);
              const isExternal = isSubdomain && link.href.startsWith("/");
              const linkStyle: React.CSSProperties = {
                color: active ? "var(--text-color)" : "var(--text-muted)",
              };
              const className = "block px-5 py-2.5 text-sm font-medium transition-colors duration-200";
              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.18, ease: "easeOut" }}
                >
                  {isExternal ? (
                    <a href={href} className={className} style={linkStyle}>
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className={className} style={linkStyle}>
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              );
            })}
            {config.cta && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: config.links.length * 0.04, duration: 0.18, ease: "easeOut" }}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
