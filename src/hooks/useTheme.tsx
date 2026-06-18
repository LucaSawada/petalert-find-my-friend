import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

const THEME_COLORS: Record<Theme, string> = {
  light: "#F1E7D6",
  dark: "#1A1014",
};

const readInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("petalert-theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLORS[theme];
};

// Listeners shared across all instances of the hook to keep them in sync
const listeners = new Set<(t: Theme) => void>();

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem("petalert-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const fn = (t: Theme) => setThemeState(t);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    listeners.forEach((l) => l(t));
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    listeners.forEach((l) => l(next));
  }, []);

  return { theme, toggle, setTheme };
};
