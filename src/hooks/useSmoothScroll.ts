import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

// Module-level singleton so non-React code (route transitions, the hero scroll
// button) can drive programmatic scrolling via getLenis().
let lenisInstance: Lenis | null = null;

export const getLenis = () => lenisInstance;

/**
 * Initialises Lenis smooth scrolling once and syncs it with GSAP's ticker and
 * ScrollTrigger. Call from a component that mounts a single time (Layout).
 * Degrades to native scroll under prefers-reduced-motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      lerp: reduce ? 1 : 0.1,
      // Smooth the desktop wheel only. Touch is left native: Lenis' syncTouch
      // interpolates touch movement (feels slow/laggy on mobile) and
      // preventDefaults touch events, which also re-focuses form fields and
      // pops the on-screen keyboard back up when scrolling. ScrollTrigger
      // listens to native scroll directly, so reveals still animate on mobile.
      smoothWheel: !reduce,
    });
    lenisInstance = lenis;

    // Keep ScrollTrigger in sync with Lenis' virtual scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker for a single, jank-free RAF loop.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Recompute trigger start positions once layout settles — the mobile
    // address bar / dynamic viewport (dvh) can otherwise leave them stale,
    // so below-fold reveals never fire and stay hidden at opacity 0.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
