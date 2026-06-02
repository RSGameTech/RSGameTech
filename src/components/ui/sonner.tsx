import { Toaster as SonnerToaster, toast } from "sonner";
import type * as React from "react";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

// Sonner reads CSS custom properties from the active theme automatically —
// no external theme provider needed.
const Toaster = ({ ...props }: ToasterProps) => (
  <SonnerToaster
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster, toast };
