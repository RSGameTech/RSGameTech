import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimer, utils } from "animejs";

// ── Viewport hook ──────────────────────────────────────────────────────────────
/**
 * Measures the orb container rather than `window`.
 *
 * The container is a `.bg-layer` sized to the *large* viewport (100lvh), so its
 * box already spans the strip iOS Safari uncovers when it retracts the address
 * bar. `window.innerHeight` tracks the small viewport instead, which would keep
 * the orbs' wander area short and leave that strip empty.
 */
function useViewport(ref: React.RefObject<HTMLElement>) {
  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        setViewport((prev) => {
          const w = Math.round(rect.width);
          const h = Math.round(rect.height);
          // Bail on no-op updates — Safari fires a resize burst per bar animation
          // and each state change would re-seed every orb's drift.
          return prev.w === w && prev.h === h ? prev : { w, h };
        });
      });
    };

    measure();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

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

// ── Wander bounds ──────────────────────────────────────────────────────────────
interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Travel box for one orb. The overscan lets blobs drift a little past each edge
 * so they softly enter and exit instead of visibly bouncing off an invisible
 * wall at the viewport border.
 */
function orbBounds(vw: number, vh: number, orbPx: number): Bounds {
  const overscan = orbPx * 0.35;
  return {
    minX: -overscan,
    maxX: vw - orbPx + overscan,
    minY: -overscan,
    maxY: vh - orbPx + overscan,
  };
}

// ── Orb definitions ────────────────────────────────────────────────────────────
const ORB_BASE: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  pointerEvents: "none",
  willChange: "transform",
};

/**
 * A tight purple → indigo → magenta → violet → pink set, in the spirit of the
 * HyperOS "About device" backdrop: few, large, saturated blobs rather than a
 * scattered rainbow. Order matters — mobile takes the first three.
 */
const ORBS = [
  { color: "var(--accent-purple)", orbPx: 960 }, // oklch(0.7 0.18 270)
  { color: "oklch(0.66 0.2 250)", orbPx: 910 }, // indigo
  { color: "var(--accent-magenta)", orbPx: 870 }, // oklch(0.7 0.18 310)
  { color: "oklch(0.6 0.19 285)", orbPx: 840 }, // deep violet
  { color: "oklch(0.72 0.19 330)", orbPx: 800 }, // pink
] as const;

/**
 * How often a fresh random target is handed to the drift animation. Deliberately
 * far shorter than the tween duration below — see the note in the effect.
 */
const DRIFT_INTERVAL = 3000;
const DRIFT_MIN_DURATION = 6000;
const DRIFT_MAX_DURATION = 10000;

// ── AmbientOrbs ────────────────────────────────────────────────────────────────
const AmbientOrbs = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { w, h } = useViewport(containerRef);
  const reducedMotion = useReducedMotion();
  const mobile = w < 768;
  const visibleOrbs = mobile ? ORBS.slice(0, 3) : ORBS;
  // The radial falloff does most of the feathering, so this stays well below the
  // blur a flat-filled disc needed — a large blur radius on a ~950px box is one
  // of the more expensive things you can ask a mobile GPU for.
  const blur = mobile ? 50 : 70;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || w === 0) return;

    const orbEls = Array.from(
      container.querySelectorAll<HTMLElement>(".ambient-orb")
    );
    if (!orbEls.length) return;
    const glowEls = Array.from(
      container.querySelectorAll<HTMLElement>(".ambient-orb__glow")
    );

    // Element order matches ORBS order, so index lookups line up.
    const bounds = orbEls.map((_el, i) => orbBounds(w, h, ORBS[i].orbPx));

    const scope = createScope({ root: containerRef }).add(() => {
      // Scatter the orbs before anything animates, so there is never a frame
      // where they are all stacked in the top-left corner.
      utils.set(orbEls, {
        x: (_el: HTMLElement, i: number) =>
          utils.random(bounds[i].minX, bounds[i].maxX),
        y: (_el: HTMLElement, i: number) =>
          utils.random(bounds[i].minY, bounds[i].maxY),
        rotate: () => utils.random(-180, 180),
      });

      if (reducedMotion) return;

      /**
       * Drift.
       *
       * `composition: "blend"` is what makes this work. Re-issuing a tween on a
       * property that is still animating normally *replaces* it, which shows up
       * as a visible kink where the orb snaps onto its new heading. Blending
       * folds the new tween into the in-flight one instead, so the orb curves
       * into the new target.
       *
       * That is why DRIFT_INTERVAL is far shorter than the tween duration: every
       * new random target lands mid-flight and blends with the one before it.
       * The overlap is the effect — it gives continuous, never-repeating motion
       * with no seam at a loop boundary, replacing the waypoint-array-then-
       * re-seed cycle this component used to run on GSAP.
       *
       * Independent scaleX/scaleY ranges let the circle swell into a slowly
       * morphing ellipse — the HyperOS liquid wobble. Kept on transforms rather
       * than border-radius so it stays on the compositor and never repaints.
       */
      const drift = () => {
        animate(orbEls, {
          x: (_el: HTMLElement, i: number) =>
            utils.random(bounds[i].minX, bounds[i].maxX),
          y: (_el: HTMLElement, i: number) =>
            utils.random(bounds[i].minY, bounds[i].maxY),
          rotate: () => utils.random(-180, 180),
          scaleX: () => utils.random(0.92, 1.18, 2),
          scaleY: () => utils.random(0.88, 1.14, 2),
          duration: () => utils.random(DRIFT_MIN_DURATION, DRIFT_MAX_DURATION),
          ease: "inOutSine",
          composition: "blend",
        });
      };

      drift();
      createTimer({ duration: DRIFT_INTERVAL, loop: true, onLoop: drift });

      // Breathe. Lives on the inner glow so it never contends with the drift
      // above for `transform`. The random delay keeps the orbs from pulsing in
      // unison, and `alternate` ping-pongs so there is no restart pop.
      animate(glowEls, {
        scale: [0.86, 1.16],
        opacity: [0.72, 1],
        duration: () => utils.random(3500, 6000),
        delay: () => utils.random(0, 2500),
        loop: true,
        alternate: true,
        ease: "inOutQuad",
      });
    });

    return () => {
      // The blend tweens are created from the timer's onLoop callback, which
      // runs outside the scope constructor — the scope never registered them, so
      // clear them off the targets directly before reverting the rest.
      utils.remove(orbEls);
      scope.revert();
    };
  }, [w, h, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="bg-layer overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {w > 0 &&
        visibleOrbs.map((orb, i) => (
          <div
            key={i}
            className="ambient-orb"
            style={{ ...ORB_BASE, width: orb.orbPx, height: orb.orbPx }}
          >
            <div
              className="ambient-orb__glow"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${orb.color} 0%, transparent 70%)`,
                filter: `blur(${blur}px)`,
              }}
            />
          </div>
        ))}
    </div>
  );
};

export default AmbientOrbs;
