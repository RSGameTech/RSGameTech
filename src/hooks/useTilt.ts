import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const MAX_DEG = 8;
const LIFT_SCALE = 1.05;
// Safe zone as a fraction of each dimension (15% of width/height from each edge)
const SAFE_FRAC = 0.15;

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export function useTilt() {
  const ref = useRef<HTMLElement>(null);
  const quickRotateX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickRotateY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickScale = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const { contextSafe } = useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    // quickTo gives the pointer-follow a touch of smoothing instead of an
    // instant snap, and a separate, snappier curve for the rest-on-leave pop.
    quickRotateX.current = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power3" });
    quickRotateY.current = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power3" });
    quickScale.current = gsap.quickTo(el, "scale", { duration: 0.5, ease: "power2" });
  }, []);

  const onMouseMove = contextSafe((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || !quickRotateX.current || !quickRotateY.current || !quickScale.current) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    let nx = (x - cx) / cx;
    let ny = (y - cy) / cy;

    // Fade distance in px based on the fraction of each axis
    const fadeX = r.width * SAFE_FRAC;
    const fadeY = r.height * SAFE_FRAC;

    // Normalised 0→1 edge distances, clamped, then smoothstepped
    const tX = smoothstep(Math.min(Math.min(x, r.width - x) / fadeX, 1));
    const tY = smoothstep(Math.min(Math.min(y, r.height - y) / fadeY, 1));
    const edgeFade = Math.min(tX, tY);

    nx *= edgeFade;
    ny *= edgeFade;

    quickRotateY.current(nx * MAX_DEG);
    quickRotateX.current(-ny * MAX_DEG);
    quickScale.current(1 + (LIFT_SCALE - 1) * edgeFade);
  });

  const onMouseLeave = contextSafe(() => {
    if (!quickRotateX.current || !quickRotateY.current || !quickScale.current) return;
    quickRotateX.current(0);
    quickRotateY.current(0);
    quickScale.current(1);
  });

  return { ref, onMouseMove, onMouseLeave };
}
