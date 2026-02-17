import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface GlassContainerProps {
  children: ReactNode;
  variant?: "default" | "inner";
  className?: string;
}

const GlassContainer = ({ children, variant = "default", className }: GlassContainerProps) => {
  return (
    <Card
      className={cn(
        "rounded-xl glow-container border-0",
        variant === "default" ? "glass p-6" : "glass-inner p-4",
        className
      )}
    >
      {children}
    </Card>
  );
};

export default GlassContainer;
