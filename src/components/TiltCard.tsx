import { useTilt } from "@/hooks/useTilt";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TiltCard = ({ children, className, style }: TiltCardProps) => {
  const { ref, onMouseMove, onMouseLeave } = useTilt();

  return (
    <div style={{ perspective: 800 }} className="h-full">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={cn("transition-[box-shadow,border-color] duration-300", className)}
        style={{
          transformStyle: "preserve-3d",
          transition: "box-shadow 0.3s",
          willChange: "transform",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
