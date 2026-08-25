import { Suspense, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getLenis } from "@/hooks/useSmoothScroll";
import PageLoadingFallback from "@/components/PageLoadingFallback";

interface PageTransitionProps {
  children: ReactNode;
  /** Changes whenever the route changes — drives the exit/enter sequence. */
  locationKey: string;
}

/**
 * Exit-aware route transition. Holds a snapshot of the current page, fades it
 * out on navigation, swaps in the new page (scrolling to top), then fades it
 * in — the GSAP replacement for framer-motion's AnimatePresence. Honours
 * prefers-reduced-motion by swapping instantly.
 */
const PageTransition = ({ children, locationKey }: PageTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayChildren, setDisplayChildren] = useState<ReactNode>(children);
  const [displayKey, setDisplayKey] = useState(locationKey);

  useGSAP(
    (_context, contextSafe) => {
      // First render / no actual route change — nothing to animate. Each page's
      // own RevealGroup handles its initial reveal.
      if (locationKey === displayKey) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const swap = () => {
        setDisplayChildren(children);
        setDisplayKey(locationKey);
        getLenis()?.scrollTo(0, { immediate: true });
      };

      if (reduce) {
        swap();
        return;
      }

      const enter = contextSafe?.(() => {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
        );
      });

      gsap.to(containerRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.18,
        ease: "power1.in",
        onComplete: () => {
          swap();
          enter?.();
        },
      });
    },
    { dependencies: [locationKey] }
  );

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {/*
       * The route-level Suspense boundary lives *here*, not above <Routes>.
       *
       * Every page is a lazy() import rendered through Layout's outlet. With the
       * boundary above Layout, a suspending chunk unmounts the entire Layout
       * subtree — Navbar, AmbientOrbs and the Lenis instance included — and
       * swaps in the fallback, which is the blank flash on navigation. It is
       * invisible locally (the chunk is already cached) but plainly visible on
       * Vercel, where each route chunk is a cold network fetch.
       *
       * Keeping it inside the animated container confines suspension to the page
       * content: the background and navbar stay mounted, this component keeps its
       * displayKey state so the exit/enter fade still runs, and Lenis is no
       * longer torn down and rebuilt on every navigation.
       */}
      <Suspense fallback={<PageLoadingFallback />}>{displayChildren}</Suspense>
    </div>
  );
};

export default PageTransition;
