import { useEffect, useState } from "react";

export const THEMES = [
  { id: "dark-minimal", label: "Dark Minimal", type: "dark" },
  { id: "minimal-light", label: "Light Minimal", type: "light" },
  { id: "nord", label: "Nord", type: "dark" },
  { id: "solarized", label: "Solarized", type: "dark" },
  { id: "catppuccin-latte", label: "Catppuccin Latte", type: "light" },
  { id: "catppuccin-frappe", label: "Catppuccin Frappé", type: "dark" },
  { id: "catppuccin-macchiato", label: "Catppuccin Macchiato", type: "dark" },
  { id: "catppuccin-mocha", label: "Catppuccin Mocha", type: "dark" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

function getInitialTheme(): ThemeId {
  const saved = localStorage.getItem("portfolio-theme") as ThemeId | null;
  if (saved && THEMES.some((t) => t.id === saved)) return saved;

  // First visit: sync with OS preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark-minimal" : "minimal-light";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  return { theme, setTheme, themes: THEMES };
}
