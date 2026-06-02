export interface NavLink {
  label: string;
  // internal path (e.g. "/projects") or full URL for external links
  href: string;
}

export interface NavConfig {
  // text shown as the logo; defaults to "ritam" if omitted
  logo?: string;
  links: NavLink[];
  // optional call-to-action button rendered at the right end of the nav
  cta?: { label: string; href: string };
}

// Example link entry:
// { label: "About", href: "/about" }

// Example CTA:
// cta: { label: "Hire Me", href: "mailto:you@example.com" }

const navbar: NavConfig = {
  logo: "RSGameTech",
  links: [
    { label: "Projects", href: "/projects" },
    // { label: "Blog", href: "/blogs" },
    { label: "Links", href: "/links" },
    { label: "Uses", href: "/uses" },
  ],
};

export default navbar;
