import { useConfig } from "@/hooks/useConfig";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { revealVariants, staggerContainer } from "@/hooks/useScrollReveal";

interface HeroConfig {
  name: string;
  tagline: string;
  role: string;
  socials: { label: string; url: string; icon: string }[];
}

const HeroSection = () => {
  const { data: config, isLoading } = useConfig<HeroConfig>("/config/hero.json", {
    name: "RSGameTech",
    tagline: "Building Digital Experiences",
    role: "Developer",
    socials: [],
  });

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center w-full">
        <div className="w-full glass rounded-xl glow-container border-0 p-6 space-y-6 flex flex-col items-center">
          <Skeleton className="h-16 w-3/4 md:w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center">
      <Card className="glass rounded-xl glow-container border-0 w-full text-center p-6 space-y-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.h1 variants={revealVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            {config.name}
          </motion.h1>
          <motion.div variants={revealVariants}>
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
              {config.tagline}
            </Badge>
          </motion.div>
          <motion.p variants={revealVariants} className="text-muted-foreground text-lg">
            {config.role}
          </motion.p>
          <motion.div variants={revealVariants} className="flex items-center justify-center gap-3 pt-2">
            {config.socials.map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size="icon"
                asChild
                className="glass-inner rounded-lg hover:bg-accent"
              >
                <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <img
                    src={`https://cdn.simpleicons.org/${social.icon}`}
                    alt={social.label}
                    className="w-5 h-5 invert-icon"
                    loading="lazy"
                  />
                </a>
              </Button>
            ))}
          </motion.div>
        </motion.div>
      </Card>
    </section>
  );
};

export default HeroSection;
