import { useRef } from "react";
import { useInView, type Variant } from "framer-motion";

interface ScrollRevealOptions {
  once?: boolean;
  margin?: string;
  amount?: number;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: options.once ?? true,
    margin: (options.margin ?? "-80px") as any,
    amount: options.amount ?? 0.2,
  });

  return { ref, isInView };
}

export const revealVariants = {
  hidden: { opacity: 0, y: 30 } as Variant,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  } as Variant,
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};
