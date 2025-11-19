"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const storageKey: string = "saas-starter-theme";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored: ThemeMode | null = (localStorage.getItem(storageKey) as ThemeMode | null) ?? null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersDark: boolean = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle(): ReactElement {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const isDark: boolean = theme === "dark";

  const applyTheme = useCallback((next: ThemeMode) => {
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, next);
    }
  }, []);

  useEffect(() => {
    const nextTheme: ThemeMode = getInitialTheme();
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function handleToggle(): void {
    const nextTheme: ThemeMode = isDark ? "light" : "dark";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
      className="toggle-glow fixed right-4 top-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 p-2 text-xs font-medium text-foreground shadow-lg backdrop-blur transition hover:border-primary/70 hover:text-primary sm:h-10 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
    >
      {isDark ? (
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"} mode</span>
    </button>
  );
}
