export interface SocialLink {
  label: string;
  url: string;
  // slug for SimpleIcons CDN (simpleicons.org) or lucide icon name
  icon?: string;
  iconLib?: "simple" | "lucide" | "svg";
  svgPath?: string;
  // set to false to hide this link from the hero section (default: true)
  showInHero?: boolean;
}

// Single source of truth for all social links used across the site
export const socials: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/RSGameTech", icon: "github", iconLib: "simple" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/ritam0604/", icon: "linkedin", iconLib: "lucide" },
  // { label: "Twitter",  url: "https://twitter.com",                    icon: "x",        iconLib: "simple" },
];
