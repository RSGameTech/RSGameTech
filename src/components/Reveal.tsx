import {
  createElement,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface RevealGroupProps {
  children: ReactNode;
  /** "scroll" reveals when the group enters the viewport; "mount" reveals on load. */
  trigger?: "mount" | "scroll";
  stagger?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Container that fades-up its descendant `<Reveal>` (data-reveal) elements with
 * a stagger — the GSAP replacement for framer-motion's staggerContainer.
 * Honours prefers-reduced-motion via gsap.matchMedia().
 */
export function RevealGroup({
  children,
  trigger = "scroll",
  stagger = 0.12,
  as: Tag = "div",
  className,
  style,
}: RevealGroupProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = scope.current?.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!items || items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(items, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(items, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power3.out",
          stagger,
          delay: trigger === "mount" ? 0.1 : 0,
          scrollTrigger:
            trigger === "scroll"
              ? { trigger: scope.current, start: "top 85%", once: true }
              : undefined,
        });
      });
    },
    { scope }
  );

  return createElement(Tag, { ref: scope, className, style }, children);
}

interface RevealProps {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * A single fade-up item inside a <RevealGroup>. Replaces framer-motion's
 * `motion.div variants={revealVariants}`.
 */
export function Reveal({ children, as: Tag = "div", className, style }: RevealProps) {
  return createElement(Tag, { "data-reveal": "", className, style }, children);
}
