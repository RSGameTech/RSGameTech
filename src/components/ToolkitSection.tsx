import { useRef, useEffect } from "react";
import { hslToHex } from "@/lib/utils";
import TiltCard from "@/components/TiltCard";
import config from "@/config/toolkit";
import { motion, useInView } from "framer-motion";
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

function LucideIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, "");
  const key = Object.keys(iconMap).find(
    (k) => k.toLowerCase().replace(/[-_\s]/g, "") === normalizedName
  );
  if (!key) return <div className={className} style={{ ...style, width: 32, height: 32 }} />;
  const Icon = iconMap[key];
  return <Icon className={className} style={style} size={32} />;
}

// Reads the real-time translateX from the browser's computed style matrix (works mid-animation).
function getTranslateX(el: HTMLElement): number {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return 0;
  return new DOMMatrix(t).m41;
}

type ToolkitItem = typeof config.items[0];

function MarqueeTile({ item }: { item: ToolkitItem }) {
  return (
    <div style={{ flexShrink: 0 }} className="w-[120px] md:w-[128px] aspect-[4/3]">
      <TiltCard
        className="tech-tile rounded-xl p-3 flex flex-col items-center justify-center gap-2 h-full cursor-default"
        style={{ "--tile-tint": item.tint } as React.CSSProperties}
      >
        {item.iconLib === "lucide" ? (
          <LucideIcon
            name={item.slug}
            className="tile-icon w-8 h-8"
            style={{ color: `hsl(${item.tint})` }}
          />
        ) : (
          <img
            src={`https://cdn.simpleicons.org/${item.slug}/${hslToHex(item.tint)}`}
            alt={item.name}
            className="tile-icon w-8 h-8"
            draggable={false}
            loading="lazy"
          />
        )}
        <span className="text-xs font-medium text-foreground text-center leading-tight">
          {item.name}
        </span>
      </TiltCard>
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  duration = 25,
}: {
  items: ToolkitItem[];
  direction: "left" | "right";
  duration?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // All mutable drag state in one ref — no re-renders triggered
  const drag = useRef({ active: false, startX: 0, startTX: 0, halfWidth: 0 });
  const isHovered = useRef(false);

  const animName = direction === "left" ? "marquee-left" : "marquee-right";
  // Full animation shorthand used both at mount and when restoring after drag
  const buildAnim = (delaySec: number) =>
    `${animName} ${duration}s linear ${delaySec}s infinite`;

  useEffect(() => {
    const move = (clientX: number) => {
      if (!drag.current.active || !trackRef.current) return;
      const { startX, startTX, halfWidth } = drag.current;
      let newX = startTX + (clientX - startX);
      // Wrap to stay inside the valid loop window [-halfWidth, 0)
      if (halfWidth > 0) {
        newX = ((newX % halfWidth) + halfWidth) % halfWidth - halfWidth;
      }
      trackRef.current.style.transform = `translateX(${newX}px)`;
    };

    const end = () => {
      if (!drag.current.active || !trackRef.current) return;
      const el = trackRef.current;
      drag.current.active = false;
      document.body.style.cursor = "";

      const currentX = getTranslateX(el);
      const { halfWidth } = drag.current;

      if (halfWidth === 0) {
        el.style.animation = buildAnim(0);
        el.style.transform = "";
        return;
      }

      // Normalise into [-halfWidth, 0) → one full loop cycle
      let norm = currentX % halfWidth;
      if (norm > 0) norm -= halfWidth;

      const progress = Math.abs(norm) / halfWidth;
      // Negative delay makes the animation start partway through
      const delay =
        direction === "left"
          ? -(progress * duration)
          : -((1 - progress) * duration);

      // Restore animation at the exact release position, clear inline transform
      el.style.animation = buildAnim(delay);
      el.style.transform = "";

      // Re-apply hover-pause if the pointer never left while dragging
      if (isHovered.current) {
        el.style.animationPlayState = "paused";
      }
    };

    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", end);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", end);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", end);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, duration]);

  const startDrag = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    // Read the live animated position BEFORE disabling the animation
    const currentTX = getTranslateX(el);
    drag.current = {
      active: true,
      startX: clientX,
      startTX: currentTX,
      halfWidth: el.scrollWidth / 2,
    };
    // Setting animation:"none" lets our inline transform take full control —
    // simply pausing still leaves the animation origin overriding the inline value.
    el.style.animation = "none";
    el.style.transform = `translateX(${currentTX}px)`;
    document.body.style.cursor = "grabbing";
  };

  // Hover-pause is JS-driven because the JSX inline `animation` shorthand
  // bakes in animation-play-state:running, making a CSS :hover rule ineffective.
  const handleMouseEnter = () => {
    isHovered.current = true;
    if (!drag.current.active && trackRef.current) {
      trackRef.current.style.animationPlayState = "paused";
    }
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    if (!drag.current.active && trackRef.current) {
      trackRef.current.style.animationPlayState = "running";
    }
  };

  const track = [...items, ...items];

  return (
    <div
      className="marquee-container relative overflow-hidden select-none cursor-grab"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
      onMouseDown={(e) => startDrag(e.clientX)}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left edge blur */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-24 pointer-events-none"
        style={{
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          maskImage: "linear-gradient(to right, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 100%)",
        }}
      />
      {/* Right edge blur */}
      <div
        className="absolute inset-y-0 right-0 z-10 w-24 pointer-events-none"
        style={{
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
        }}
      />

      <div
        ref={trackRef}
        className="marquee-track flex"
        style={{ animation: buildAnim(0), gap: "12px", width: "max-content" }}
      >
        {track.map((item, i) => (
          <MarqueeTile key={`${item.slug}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

const ToolkitSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const items = config.items;
  const topItems = items.filter((_, i) => i % 2 === 0);
  const bottomItems = items.filter((_, i) => i % 2 !== 0);

  return (
    <section id="toolkit" className="w-full flex flex-col justify-center relative py-5">
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex flex-col gap-5"
      >
        <motion.div variants={revealVariants}>
          <h2
            className="font-bold"
            style={{ fontSize: 28, letterSpacing: "-1px", color: "var(--text-color)" }}
          >
            {config.heading || "Tech Stacks"}
          </h2>
          {config.subheading && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {config.subheading}
            </p>
          )}
        </motion.div>

        <motion.div variants={revealVariants}>
          {/* Desktop: single row */}
          <div className="hidden md:block">
            <MarqueeRow items={items} direction="left" duration={25} />
          </div>

          {/* Mobile: two rows, opposite directions */}
          <div className="md:hidden flex flex-col gap-3">
            <MarqueeRow items={topItems} direction="left" duration={20} />
            <MarqueeRow items={bottomItems} direction="right" duration={25} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ToolkitSection;
