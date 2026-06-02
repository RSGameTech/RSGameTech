import { Linkedin, Github, Twitter, Mail, type LucideIcon as LucideIconType } from "lucide-react";
import type { SocialLink } from "@/config/socials";

const iconMap: Record<string, LucideIconType> = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  mail: Mail,
};

interface Props {
  link: SocialLink;
  className?: string;
  size?: number;
}

const SocialIcon = ({ link, className = "w-4 h-4", size = 16 }: Props) => {
  if (!link.icon && !link.svgPath) return null;

  if (link.iconLib === "lucide") {
    const key = Object.keys(iconMap).find(
      (k) => k.replace(/[-_\s]/g, "") === (link.icon ?? "").toLowerCase().replace(/[-_\s]/g, "")
    );
    if (!key) return null;
    const Icon = iconMap[key];
    return <Icon size={size} className={className} />;
  }

  if (link.iconLib === "svg" && link.svgPath) {
    return <img src={link.svgPath} alt={link.label} className={`invert-icon ${className}`} loading="lazy" />;
  }

  return (
    <img
      src={`https://cdn.simpleicons.org/${link.icon}`}
      alt={link.label}
      className={`invert-icon ${className}`}
      loading="lazy"
    />
  );
};

export default SocialIcon;
