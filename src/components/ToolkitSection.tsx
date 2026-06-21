import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { hslToHex } from "@/lib/utils";
import TiltCard from "@/components/TiltCard";
import config from "@/config/toolkit";
import { RevealGroup, Reveal } from "@/components/Reveal";
import { Code, Terminal, Database, Cpu, Globe, Server, Layout, Smartphone, Cloud, type LucideIcon as LucideIconType } from "lucide-react";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

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
  const key = Object.keys(iconMap).find((k) => k.toLowerCase().replace(/[-_\s]/g, "") === normalizedName);
  if (!key) return <div className={className} style={{ ...style, width: 32, height: 32 }} />;
  const Icon = iconMap[key];
  return <Icon className={className} style={style} size={32} />;
}

type ToolkitItem = (typeof config.items)[0];

function MarqueeTile({ item }: { item: ToolkitItem }) {
  return (
    <div style={{ flexShrink: 0 }} className="w-[120px] md:w-[128px] aspect-[4/3]">
      <TiltCard className="tech-tile rounded-xl p-3 flex flex-col items-center justify-center gap-2 h-full cursor-default" style={{ "--tile-tint": item.tint } as React.CSSProperties}>
        {item.iconLib === "lucide" ? <LucideIcon name={item.slug} className="tile-icon w-8 h-8" style={{ color: `hsl(${item.tint})` }} /> : <img src={`https://cdn.simpleicons.org/${item.slug}/${hslToHex(item.tint)}`} alt={item.name} className="tile-icon w-8 h-8" draggable={false} loading="lazy" />}
        <span className="text-xs font-medium text-foreground text-center leading-tight">{item.name}</span>
      </TiltCard>
    </div>
  );
}

function MarqueeRow({ items, direction, duration = 25 }: { items: ToolkitItem[]; direction: "left" | "right"; duration?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // Shared between the GSAP setup below and the React hover handlers —
  // `sync` re-evaluates play/pause from the latest hovered/interacting flags.
  const state = useRef({ hovered: false, interacting: false, sync: () => {} });

  useGSAP(
    () => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;

      // One of the two MarqueeRow instances (desktop vs. mobile breakpoint)
      // is always `display:none` at any given viewport — Tailwind's `hidden`
      // doesn't unmount it — so scrollWidth reads 0 until it's actually shown.
      // Defer setup until the row has real layout.
      const init = () => {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth === 0) return false;

        const fromX = direction === "left" ? 0 : -halfWidth;
        const toX = direction === "left" ? -halfWidth : 0;
        gsap.set(track, { x: fromX });

        // Content is duplicated (see `track` below), so looping fromX -> toX
        // over one set's width is a seamless infinite scroll.
        const tween = gsap.to(track, { x: toX, duration, ease: "none", repeat: -1 });

        state.current.sync = () => {
          if (state.current.interacting) return;
          if (state.current.hovered) tween.pause();
          else tween.play();
        };

        // Re-wrap into the loop window during drag/throw — content repeats,
        // so jumping by one set's width is invisible to the eye.
        function wrap(this: Draggable) {
          if (this.x > 0) this.x -= halfWidth;
          else if (this.x <= -halfWidth) this.x += halfWidth;
        }

        const resync = () => {
          state.current.interacting = false;
          const x = gsap.getProperty(track, "x") as number;
          let norm = x % halfWidth;
          if (norm > 0) norm -= halfWidth;
          gsap.set(track, { x: norm });
          const progress = direction === "left" ? -norm / halfWidth : (norm + halfWidth) / halfWidth;
          tween.progress(progress % 1);
          state.current.sync();
        };

        Draggable.create(track, {
          type: "x",
          inertia: true,
          // Tame both the live drag (moves slower than the pointer) and the
          // post-release momentum (decelerates faster, travels less).
          dragResistance: 0.5,
          throwResistance: 4000,
          cursor: "grab",
          activeCursor: "grabbing",
          onPress() {
            state.current.interacting = true;
            tween.pause();
          },
          onDrag: wrap,
          onThrowUpdate: wrap,
          onDragEnd() {
            if (!this.isThrowing) resync();
          },
          onThrowComplete: resync,
        });
        return true;
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(track, { x: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (init()) return;
        const ro = new ResizeObserver(() => {
          if (init()) ro.disconnect();
        });
        ro.observe(container);
        return () => ro.disconnect();
      });
    },
    { scope: containerRef, dependencies: [direction, duration] },
  );

  const handleMouseEnter = () => {
    state.current.hovered = true;
    state.current.sync();
  };

  const handleMouseLeave = () => {
    state.current.hovered = false;
    state.current.sync();
  };

  const track = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className="marquee-container relative overflow-hidden select-none cursor-grab"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
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

      <div ref={trackRef} className="marquee-track flex" style={{ gap: "12px", width: "max-content" }}>
        {track.map((item, i) => (
          <MarqueeTile key={`${item.slug}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

const ToolkitSection = () => {
  const items = config.items;
  const topItems = items.filter((_, i) => i % 2 === 0);
  const bottomItems = items.filter((_, i) => i % 2 !== 0);

  return (
    <section id="toolkit" className="w-full flex flex-col justify-center relative py-5">
      <RevealGroup className="flex flex-col gap-5">
        <Reveal>
          <h2 className="font-bold" style={{ fontSize: 28, letterSpacing: "-1px", color: "var(--text-color)" }}>
            {config.heading || "Tech Stacks"}
          </h2>
          {config.subheading && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {config.subheading}
            </p>
          )}
        </Reveal>

        <Reveal>
          {/* Desktop: single row */}
          <div className="hidden md:block">
            <MarqueeRow items={items} direction="left" duration={25} />
          </div>

          {/* Mobile: two rows, opposite directions */}
          <div className="md:hidden flex flex-col gap-3">
            <MarqueeRow items={topItems} direction="left" duration={20} />
            <MarqueeRow items={bottomItems} direction="right" duration={25} />
          </div>
        </Reveal>
      </RevealGroup>
    </section>
  );
};

export default ToolkitSection;
