import { useConfig } from "@/hooks/useConfig";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Globe,
  Link,
  Heart,
  User,
  Star,
  type LucideIcon as LucideIconType,
} from "lucide-react";

// Map of allowed icons to enable tree-shaking
const iconMap: Record<string, LucideIconType> = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  mail: Mail,
  globe: Globe,
  link: Link,
  heart: Heart,
  user: User,
  star: Star,
};

interface SocialLink {
  label: string;
  url: string;
  icon?: string;
  iconLib?: "simple" | "lucide" | "svg";
  svgPath?: string;
}

interface FooterConfig {
  timezone: string;
  timezoneLabel: string;
  licence: { title: string; body: string };
  socials: { title: string; links: SocialLink[] };
}

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, "");
  // Find key that matches normalized name
  const key = Object.keys(iconMap).find(
    (k) => k.toLowerCase().replace(/[-_\s]/g, "") === normalizedName
  );
  
  if (!key) return null;
  const Icon = iconMap[key];
  return <Icon className={className} size={18} />;
}

const FooterSection = () => {
  const { data: config } = useConfig<FooterConfig>("/config/footer.json", {
    timezone: "UTC",
    timezoneLabel: "UTC",
    licence: { title: "Licence", body: "" },
    socials: { title: "Socials", links: [] },
  });

  const [time, setTime] = useState("");
  const [drawer, setDrawer] = useState<null | "time" | "licence" | "socials">(null);

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
  }, [config.timezone]);

  const renderSocialIcon = (link: SocialLink) => {
    if (!link.icon && !link.svgPath) return null;
    if (link.iconLib === "lucide") {
      return <LucideIcon name={link.icon || ""} className="w-[18px] h-[18px] invert-icon" />;
    }
    if (link.iconLib === "svg" && link.svgPath) {
      return (
        <img
          src={link.svgPath}
          alt={link.label}
          className="w-[18px] h-[18px] invert-icon"
          loading="lazy"
        />
      );
    }
    return (
      <img
        src={`https://cdn.simpleicons.org/${link.icon}`}
        alt={link.label}
        className="w-[18px] h-[18px] invert-icon"
        loading="lazy"
      />
    );
  };

  return (
    <>
      <footer className="mt-auto">
        <div className="flex flex-col items-center justify-center gap-3 pb-4">
          <Button
            variant="ghost"
            onClick={() => setDrawer("time")}
            className="glass px-5 py-2.5 rounded-xl text-sm text-muted-foreground desktop:hover:text-foreground"
          >
            It's <span className="text-foreground font-medium mx-1">{time}</span> in my timezone
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setDrawer("licence")}
              className="glass px-5 py-2.5 rounded-xl text-sm text-muted-foreground desktop:hover:text-foreground"
            >
              Licence
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDrawer("socials")}
              className="glass px-5 py-2.5 rounded-xl text-sm text-muted-foreground desktop:hover:text-foreground"
            >
              Socials
            </Button>
          </div>
        </div>
      </footer>

      <Drawer open={drawer === "time"} onOpenChange={(open) => !open && setDrawer(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md p-6 pb-8">
            <DrawerHeader className="px-0">
              <DrawerTitle>My Timezone</DrawerTitle>
            </DrawerHeader>
            <p className="text-muted-foreground">{config.timezoneLabel}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{time}</p>
            {(() => {
              try {
                const now = new Date();
                const localOffset = -now.getTimezoneOffset();
                const formatter = new Intl.DateTimeFormat("en-US", { timeZone: config.timezone, timeZoneName: "shortOffset" });
                const parts = formatter.formatToParts(now);
                const tzPart = parts.find(p => p.type === "timeZoneName")?.value || "";
                const match = tzPart.match(/GMT([+-]?\d+(?::\d+)?)/);
                let remoteOffset = 0;
                if (match) {
                  const [h, m] = match[1].split(":").map(Number);
                  remoteOffset = (h || 0) * 60 + (Math.sign(h || 0) * (m || 0));
                }
                const diff = remoteOffset - localOffset;
                const absH = Math.floor(Math.abs(diff) / 60);
                const absM = Math.abs(diff) % 60;
                const label = diff === 0
                  ? "Same as your local time"
                  : `${diff > 0 ? "+" : "-"}${absH}h${absM ? ` ${absM}m` : ""} from your local time`;
                return <p className="text-sm text-muted-foreground mt-1">{label}</p>;
              } catch {
                return null;
              }
            })()}
            <Button onClick={() => setDrawer(null)} className="w-full mt-6">
              Okay
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={drawer === "licence"} onOpenChange={(open) => !open && setDrawer(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md p-6 pb-8">
            <DrawerHeader className="px-0">
              <DrawerTitle>{config.licence.title}</DrawerTitle>
            </DrawerHeader>
            <p className="text-muted-foreground leading-relaxed">{config.licence.body}</p>
            <Button onClick={() => setDrawer(null)} className="w-full mt-6">
              Okay
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={drawer === "socials"} onOpenChange={(open) => !open && setDrawer(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md p-6 pb-8">
            <DrawerHeader className="px-0">
              <DrawerTitle>{config.socials.title}</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-2">
              {config.socials.links.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  asChild
                  className="glass-inner px-4 py-3 rounded-lg text-foreground desktop:hover:bg-accent justify-start"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                    {renderSocialIcon(link)}
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
            <Button onClick={() => setDrawer(null)} className="w-full mt-6">
              Okay
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default FooterSection;
