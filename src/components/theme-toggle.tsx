"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    const currentTheme = getCurrentTheme();
    setDocumentTheme(currentTheme);
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  return (
    <button
      aria-label={mounted ? `Switch to ${nextTheme} mode` : "Toggle color theme"}
      aria-pressed={mounted ? theme === "dark" : undefined}
      className="theme-toggle"
      onClick={() => {
        setDocumentTheme(nextTheme);
        storeTheme(nextTheme);
        setTheme(nextTheme);
      }}
      type="button"
    >
      {mounted ? (theme === "dark" ? <SunIcon /> : <MoonIcon />) : <span aria-hidden="true" className="theme-toggle-icon" />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" className="theme-toggle-icon" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="theme-toggle-icon" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function getCurrentTheme(): Theme {
  const activeTheme = document.documentElement.dataset.theme;
  if (activeTheme === "dark" || activeTheme === "light") {
    return activeTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setDocumentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Theme still changes for the current page when storage is unavailable.
  }
}
