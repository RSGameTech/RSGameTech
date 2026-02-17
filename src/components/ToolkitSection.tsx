import { useConfig } from "@/hooks/useConfig";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, revealVariants } from "@/hooks/useScrollReveal";
import {
  Code,
  Terminal,
  Database,
  Cpu,
  Globe,
  Server,
  Layout,
  Smartphone,
  Cloud,
  type LucideIcon as LucideIconType,
} from "lucide-react";

// Map of allowed icons to enable tree-shaking
const iconMap: Record<string, LucideIconType> = {
  code: Code,
  terminal: Terminal,
  database: Database,
  cpu: Cpu,
  globe: Globe,
  server: Server,
  layout: Layout,
  smartphone: Smartphone,
  cloud: Cloud,
};

interface ToolkitItem {
  name: string;
  slug: string;
  category: string;
  tint: string;
  iconLib?: "simple" | "lucide";
}

interface ToolkitConfig {
  title?: string;
  categories: string[];
  items: ToolkitItem[];
}

function hslToHex(hsl: string): string {
  const parts = hsl.split(/\s+/);
  const h = parseFloat(parts[0]) || 0;
  const s = (parseFloat(parts[1]) || 0) / 100;
  const l = (parseFloat(parts[2]) || 0) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

function LucideIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, "");
  // Find key that matches normalized name
  const key = Object.keys(iconMap).find(
    (k) => k.toLowerCase().replace(/[-_\s]/g, "") === normalizedName
  );
  
  if (!key) return <div className={className} style={{ ...style, width: 32, height: 32 }} />;
  const Icon = iconMap[key];
  return <Icon className={className} style={style} size={32} />;
}

const ToolkitSection = () => {
  const { data: config, isLoading } = useConfig<ToolkitConfig>("/config/toolkit.json", {
    title: "Tech Stacks",
    categories: ["All"],
    items: [],
  });
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? config.items : config.items.filter((i) => i.category === active);

  if (isLoading) {
    return (
      <section>
        <Card className="glass rounded-xl glow-container border-0 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-2 mb-6">
             <Skeleton className="h-8 w-16 rounded-full" />
             <Skeleton className="h-8 w-16 rounded-full" />
             <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
             {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
             ))}
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <Card className="glass rounded-xl glow-container border-0">
        <CardHeader>
          <h2 className="text-2xl font-bold text-foreground">{config.title || "Tech Stacks"}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <ToggleGroup
            type="single"
            value={active}
            onValueChange={(val) => val && setActive(val)}
            className="flex gap-2 flex-wrap justify-start"
          >
            {config.categories.map((cat) => (
              <ToggleGroupItem
                key={cat}
                value={cat}
                className="px-4 py-1.5 rounded-full text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground glass-inner text-muted-foreground hover:text-foreground"
              >
                {cat}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={active}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
          >
            {filtered.map((item) => (
              <motion.div
                key={item.slug}
                variants={revealVariants}
                className="rounded-lg p-4 flex flex-col items-center gap-2.5 transition-all desktop:hover:scale-105 border"
                style={{
                  backgroundColor: `hsla(${item.tint} / 0.1)`,
                  borderColor: `hsla(${item.tint} / 0.15)`,
                  boxShadow: `0 0 12px -4px hsla(${item.tint} / 0.2)`,
                }}
              >
                {item.iconLib === "lucide" ? (
                  <LucideIcon
                    name={item.slug}
                    className="w-8 h-8"
                    style={{ color: `hsl(${item.tint})` }}
                  />
                ) : (
                  <img
                    src={`https://cdn.simpleicons.org/${item.slug}/${hslToHex(item.tint)}`}
                    alt={item.name}
                    className="w-8 h-8"
                    loading="lazy"
                  />
                )}
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ToolkitSection;
