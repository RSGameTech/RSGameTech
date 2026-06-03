import { motion } from "framer-motion";
import FooterSection from "@/components/FooterSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import { staggerContainer, revealVariants } from "@/hooks/useScrollReveal";
import { ChevronRight, Link as LinkIcon, Github, Twitter, Globe, BookOpen, FileText, LifeBuoy } from "lucide-react";
import config from "@/config/links";
import type { LinksConfig } from "@/config/links";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  link: LinkIcon,
  github: Github,
  twitter: Twitter,
  globe: Globe,
  "book-open": BookOpen,
  "file-text": FileText,
  "life-buoy": LifeBuoy,
};

const LinkGroup = ({ group }: { group: LinksConfig["groups"][number] }) => {
  return (
    <Card className="glass rounded-xl glow-container border-0 p-4">
      <h2 className="text-base font-semibold text-foreground mb-3">{group.title}</h2>
      <div className="flex flex-col gap-2">
        {group.links.map((link) => {
          const Icon = iconMap[link.icon || "link"] || LinkIcon;
          if (link.disabled) {
            return (
              <div key={link.label + link.url} className="glass-inner glow-container flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-30 cursor-not-allowed">
                <Icon className="w-4 h-4 shrink-0 opacity-50" />
                <span className="flex-1 text-sm text-muted-foreground/50">{link.label}</span>
              </div>
            );
          }
          return (
            <Button key={link.label + link.url} variant="ghost" asChild className="glass-inner glow-container flex flex-col items-stretch px-0 py-0 rounded-lg h-auto text-foreground/80 desktop:hover:text-foreground group overflow-hidden transition-colors duration-300">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.image && <img src={link.image} alt={link.label} className="w-full aspect-video object-cover" loading="lazy" />}
                <div className="flex items-center gap-3 px-3 py-2.5 w-full">
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span className="flex-1 text-sm">{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40 desktop:group-hover:opacity-100 desktop:group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </a>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

const Links = () => {
  useMouseGlow();

  return (
    <main className="flex flex-col gap-3 px-4 max-w-md mx-auto min-h-screen pb-[20px] pt-[70px]">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {config.title && (
          <motion.h1 variants={revealVariants} className="text-3xl font-bold text-foreground text-center mb-2">
            {config.title}
          </motion.h1>
        )}
        {config.groups.map((group) => (
          <motion.div key={group.title} variants={revealVariants}>
            <LinkGroup group={group} />
          </motion.div>
        ))}
      </motion.div>
      <FooterSection />
    </main>
  );
};

export default Links;
