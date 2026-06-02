export interface LegalLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  brand?: string;
  timezone: string;
  timezoneLabel: string;
  pagesTitle?: string;
  socialsTitle?: string;
  legal: { title: string; links: LegalLink[] };
}

const footer: FooterConfig = {
  brand: "RSGameTech",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST (UTC+5:30)",
  pagesTitle: "Pages",
  socialsTitle: "Socials",
  legal: {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy",   href: "/privacy" },
    ],
  },
};

export default footer;
