import { useEffect, useRef } from "react";

const DOT_SPACING = 34;
const DOT_RADIUS = 1.5;
const FADE_CHANCE = 0.004;

const DotGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let resizeRaf = 0;
    let cssSize = { w: 0, h: 0 };
    let dots: { x: number; y: number; opacity: number; target: number; speed: number }[] = [];

    // Measure the canvas element itself, not `window`. The element is a
    // `.bg-layer`, which is sized to the *large* viewport (100lvh), so this
    // stays correct while iOS Safari expands/retracts its address bar —
    // window.innerHeight tracks the small viewport and would leave the strip
    // Safari uncovers unpainted.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Cap DPR at 2: Safari on Retina/iOS reports up to 3, which triples the
      // fill cost of every dot for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Draw in CSS pixels; the transform handles the device-pixel scaling.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cssSize = { w, h };
      initDots();
    };

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(cssSize.w / DOT_SPACING) + 1;
      const rows = Math.ceil(cssSize.h / DOT_SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * DOT_SPACING,
            y: r * DOT_SPACING,
            opacity: 0.2 + Math.random() * 0.2,
            target: 0.2 + Math.random() * 0.2,
            speed: 0.002 + Math.random() * 0.004,
          });
        }
      }
    };

    const getColor = () => {
      const style = getComputedStyle(document.documentElement);
      const raw = style.getPropertyValue("--dot-color").trim();
      return raw || "210 20% 90%";
    };

    let lastTime = 0;
    const FRAME_INTERVAL = 50; // ~20fps for performance

    const draw = (timestamp: number) => {
      if (timestamp - lastTime < FRAME_INTERVAL) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      ctx.clearRect(0, 0, cssSize.w, cssSize.h);
      const color = getColor();

      for (const dot of dots) {
        if (Math.random() < FADE_CHANCE) {
          dot.target = Math.random() < 0.3 ? 0.05 : 0.15 + Math.random() * 0.25;
          dot.speed = 0.003 + Math.random() * 0.006;
        }
        dot.opacity += (dot.target - dot.opacity) * dot.speed * 16;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${color} / ${dot.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    // Coalesce the resize burst iOS Safari fires while the address bar animates.
    const scheduleResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };

    resize();
    draw(0);

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    // Safari only reports the address-bar collapse through visualViewport;
    // a plain `resize` on window is not always dispatched for it.
    window.visualViewport?.addEventListener("resize", scheduleResize);

    // Authoritative signal: the element's own box changed (theme swap, dvh/lvh
    // recompute, split view) even when no window-level event fired.
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleResize) : null;
    ro?.observe(canvas);

    return () => {
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
      window.visualViewport?.removeEventListener("resize", scheduleResize);
      ro?.disconnect();
      cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="bg-layer -z-10"
      aria-hidden="true"
    />
  );
};

export default DotGridBackground;
