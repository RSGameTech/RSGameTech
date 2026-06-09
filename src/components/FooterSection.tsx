import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import config from "@/config/footer";
import { useViewCounter } from "@/hooks/useViewCounter";
import { socials } from "@/config/socials";
import navbarConfig from "@/config/navbar";
import SocialIcon from "@/components/SocialIcon";

const FOOTER_SURFACE_RADIUS = 26;
const FOOTER_SURFACE_PADDING = 20;
const FOOTER_INNER_RADIUS = Math.max(FOOTER_SURFACE_RADIUS - FOOTER_SURFACE_PADDING, 0);

// ── Subdomain-aware link resolver (mirrors Navbar) ────────────────────────
const isSubdomain =
  typeof window !== "undefined" &&
  window.location.hostname !== "rsgametech.me" &&
  window.location.hostname !== "localhost";

function resolveHref(href: string) {
  if (isSubdomain && href.startsWith("/")) return `https://rsgametech.me${href}`;
  return href;
}

// ── Shared sub-components ─────────────────────────────────────────────────
function BoxHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
      {children}
    </p>
  );
}

const linkClass = "flex items-center gap-2.5 text-sm py-1 transition-colors duration-150";

// ── Component ─────────────────────────────────────────────────────────────
const FooterSection = () => {
  const [time, setTime] = useState("");
  const views = useViewCounter();

  useEffect(() => {
    const update = () => {
      try {
        setTime(
          new Date().toLocaleTimeString("en-US", {
            timeZone: config.timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const brand = config.brand ?? "RSGameTech";
  const year = new Date().getFullYear();

  const pageLinks = [{ label: "Home", href: "/" }, ...navbarConfig.links];

  return (
    <section className="w-full flex flex-col justify-center relative pt-10 pb-5 mt-auto">
      <div
        className="p-5"
        style={{
          width: "min(1000px, calc(100vw - 32px))",
          marginLeft: "calc((min(1000px, calc(100vw - 32px)) - 100%) / -2)",
          borderRadius: FOOTER_SURFACE_RADIUS,
          background: "var(--nav-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── Three boxes ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">

          {/* Pages */}
          <div className="glass-inner p-4" style={{ borderRadius: FOOTER_INNER_RADIUS }}>
            <BoxHeading>{config.pagesTitle ?? "Pages"}</BoxHeading>
            <ul className="flex flex-col gap-0.5">
              {pageLinks.map((link) => {
                const isExternal = isSubdomain && link.href.startsWith("/");
                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a
                        href={resolveHref(link.href)}
                        className={linkClass}
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className={linkClass}
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Socials */}
          <div className="glass-inner p-4" style={{ borderRadius: FOOTER_INNER_RADIUS }}>
            <BoxHeading>{config.socialsTitle ?? "Socials"}</BoxHeading>
            <ul className="flex flex-col gap-0.5">
              {socials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <SocialIcon link={link} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="glass-inner p-4 col-span-2 md:col-span-1" style={{ borderRadius: FOOTER_INNER_RADIUS }}>
            <BoxHeading>{config.legal.title}</BoxHeading>
            <ul className="flex flex-col gap-0.5">
              {config.legal.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={linkClass}
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-color)", letterSpacing: "-0.5px" }}>
              {brand}<span style={{ color: "var(--accent-purple)" }}>.</span>
            </span>
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>
              © {year} {brand}. All rights reserved.
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {views && (
              <div
                className="flex items-center gap-3 px-3 py-1.5"
                style={{
                  borderRadius: 10,
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  <span className="font-medium" style={{ color: "var(--text-muted)" }}>
                    {views.total.toLocaleString()}
                  </span>{" "}views
                </span>
                <span style={{ color: "var(--glass-border)" }}>·</span>
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  <span className="font-medium" style={{ color: "var(--text-muted)" }}>
                    {views.unique.toLocaleString()}
                  </span>{" "}unique
                </span>
              </div>
            )}
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>
              It&apos;s{" "}
              <span className="font-medium" style={{ color: "var(--text-muted)" }}>{time}</span>
              {" "}in my timezone ({config.timezoneLabel})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
