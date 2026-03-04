import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ 
  src, 
  alt, 
  width = 1200, 
  height = 630, 
  className, 
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px", 
  priority = false 
}) => {
  const [hasOptimized, setHasOptimized] = useState(false);

  useEffect(() => {
    // Check if optimized variants exist
    const urlPath = new URL(src, "http://localhost").pathname;
    const baseName = urlPath.split("/").pop()?.split(".")[0] || "";
    const ext = src.split(".").pop() || "jpg";
    
    // Try to load the medium variant to check if optimized versions exist
    const img = new Image();
    img.onload = () => setHasOptimized(true);
    img.onerror = () => setHasOptimized(false);
    img.src = `/images/blogs/optimized/${baseName}.medium.${ext}`;
  }, [src]);

  // Extract filename without extension from src
  const urlPath = new URL(src, "http://localhost").pathname;
  const baseName = urlPath.split("/").pop()?.split(".")[0] || "";
  const ext = src.split(".").pop() || "jpg";

  // Use optimized variants if they exist, otherwise use original image
  const imgSrc = hasOptimized ? `/images/blogs/optimized/${baseName}.large.${ext}` : src;
  const srcSet = hasOptimized 
    ? [`/images/blogs/optimized/${baseName}.small.${ext} 480w`, `/images/blogs/optimized/${baseName}.medium.${ext} 768w`, `/images/blogs/optimized/${baseName}.large.${ext} 1200w`].join(", ")
    : `${src} 1200w`;

  return (
    <img 
      src={imgSrc} 
      srcSet={srcSet} 
      sizes={sizes} 
      alt={alt} 
      width={width} 
      height={height} 
      loading={priority ? "eager" : "lazy"} 
      className={cn("w-full h-auto", className)} 
    />
  );
};

export default ResponsiveImage;
