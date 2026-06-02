import { useRef, useCallback } from "react";

const MAX_DEG = 8;
// Safe zone as a fraction of each dimension (15% of width/height from each edge)
const SAFE_FRAC = 0.15;

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export function useTilt() {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
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

    // No transform transition during movement — direct response; tintable properties still animate
    el.style.transition = "border-color 0.3s, background-color 0.3s";
    el.style.transform = `rotateY(${nx * MAX_DEG}deg) rotateX(${-ny * MAX_DEG}deg)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Re-enable transition for the smooth return-to-rest and tintable property resets
    el.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.3s, background-color 0.3s";
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
