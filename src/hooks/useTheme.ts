import { useEffect, useState } from "react";

export type ThemeId = "dark" | "light";

export const THEMES = [
  { id: "dark" as ThemeId, label: "Dark", type: "dark" },
  { id: "light" as ThemeId, label: "Light", type: "light" },
] as const;

function getInitialTheme(): ThemeId {
  const saved = localStorage.getItem("portfolio-theme");
  if (saved === "dark" || saved === "light") return saved;
  // Unknown / old value → fall back to OS preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);

    // Keep <meta name="theme-color"> in step with the theme. iOS Safari tints
    // the address bar and bottom toolbar with this value; without it Safari
    // picks its own fallback, which shows up as a black band against the page.
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#f0f0f8" : "#0a0b1a";
  }, [theme]);

  return { theme, setTheme, themes: THEMES };
}
