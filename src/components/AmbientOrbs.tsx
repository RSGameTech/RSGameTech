import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// ── Viewport hook ──────────────────────────────────────────────────────────────
function useViewport() {
  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    let raf: number;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setViewport({ w: window.innerWidth, h: window.innerHeight })
      );
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return viewport;
}

// ── Reduced-motion hook ──────────────────────────────────────────────────────────
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

// ── Waypoint generator ─────────────────────────────────────────────────────────
interface Waypoints {
  xs: number[];
  ys: number[];
  duration: number;
}

function randomWaypoints(
  count: number,
  vw: number,
  vh: number,
  orbPx: number,
  startX?: number,
  startY?: number
): Waypoints {
  // Slight overscan past edges so blobs softly enter/exit — reads more organic
  const overscan = orbPx * 0.35;
  const minX = -overscan;
  const maxX = vw - orbPx + overscan;
  const minY = -overscan;
  const maxY = vh - orbPx + overscan;

  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  const xs: number[] = [startX ?? rand(minX, maxX)];
  const ys: number[] = [startY ?? rand(minY, maxY)];

  for (let i = 1; i < count; i++) {
    xs.push(rand(minX, maxX));
    ys.push(rand(minY, maxY));
  }

  return {
    xs,
    ys,
    duration: 40 + Math.random() * 20, // 40–60 s — very slow & calm
  };
}

// ── Orb definitions ────────────────────────────────────────────────────────────
const ORB_BASE: React.CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
  pointerEvents: "none",
};

const ORBS = [
  { color: "var(--accent-purple)",  orbPx: 750 },
  { color: "var(--accent-magenta)", orbPx: 680 },
  { color: "oklch(0.6 0.15 200)",   orbPx: 600 }, // teal
  { color: "oklch(0.65 0.16 240)",  orbPx: 640 }, // blue
  { color: "oklch(0.7 0.17 330)",   orbPx: 560 }, // pink
  { color: "oklch(0.62 0.17 280)",  orbPx: 620 }, // violet
  { color: "oklch(0.68 0.14 160)",  orbPx: 580 }, // mint
] as const;

// ── Orb subcomponent — owns its own wander state ───────────────────────────────
interface OrbProps {
  color: string;
  orbPx: number;
  blur: number;
  reducedMotion: boolean;
  vw: number;
  vh: number;
}

const Orb = ({ color, orbPx, blur, reducedMotion, vw, vh }: OrbProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const wpRef = useRef<Waypoints>(randomWaypoints(6, vw, vh, orbPx));

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el) return;

      // Fresh random path on (re)mount and whenever the viewport changes.
      wpRef.current = randomWaypoints(6, vw, vh, orbPx);
      gsap.set(el, { x: wpRef.current.xs[0], y: wpRef.current.ys[0] });

      if (reducedMotion) return;

      // Wander through the waypoints, then re-seed from the final position for
      // seamless, never-repeating drift. contextSafe keeps each cycle's tween
      // tracked so it's reverted on unmount/resize.
      const run = contextSafe!(() => {
        const wp = wpRef.current;
        gsap.to(el, {
          keyframes: { x: wp.xs, y: wp.ys, ease: "sine.inOut" },
          duration: wp.duration,
          ease: "none",
          onComplete: () => {
            const lastX = wp.xs[wp.xs.length - 1];
            const lastY = wp.ys[wp.ys.length - 1];
            wpRef.current = randomWaypoints(6, vw, vh, orbPx, lastX, lastY);
            run();
          },
        });
      });

      run();
    },
    { dependencies: [vw, vh, reducedMotion, orbPx] }
  );

  return (
    <div
      ref={ref}
      className="ambient-orb"
      style={{
        ...ORB_BASE,
        width: orbPx,
        height: orbPx,
        background: color,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

// ── AmbientOrbs ────────────────────────────────────────────────────────────────
const AmbientOrbs = () => {
  const { w, h } = useViewport();
  const reducedMotion = useReducedMotion();
  const mobile = w < 768;
  const visibleOrbs = mobile ? ORBS.slice(0, 3) : ORBS;
  const blur = mobile ? 90 : 120;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {w > 0 &&
        visibleOrbs.map((orb, i) => (
          <Orb
            key={i}
            {...orb}
            blur={blur}
            reducedMotion={reducedMotion}
            vw={w}
            vh={h}
          />
        ))}
    </div>
  );
};

export default AmbientOrbs;
