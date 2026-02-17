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
    let dots: { x: number; y: number; opacity: number; target: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(canvas.width / DOT_SPACING) + 1;
      const rows = Math.ceil(canvas.height / DOT_SPACING) + 1;
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    resize();
    draw(0);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default DotGridBackground;
