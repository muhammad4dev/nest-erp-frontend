import { useEffect, useState } from "react";

import { THEME_MODE } from "@/config/constants";

type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];

/**
 * Hook to detect system color scheme preference reactively.
 * Listens for changes to (prefers-color-scheme: dark) media query.
 *
 * @returns "dark" | "light" based on system preference
 */
export function useSystemTheme(): "light" | "dark" {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return systemTheme;
}

/**
 * Hook to get the resolved theme mode.
 * If themeMode is "system", returns the actual system preference.
 * Otherwise returns the user's explicit choice.
 *
 * @param themeMode - The theme mode from preferences ("light" | "dark" | "system")
 * @returns "light" | "dark" - The resolved theme to apply
 */
export function useResolvedTheme(themeMode: ThemeMode): "light" | "dark" {
  const systemTheme = useSystemTheme();

  if (themeMode === THEME_MODE.SYSTEM) {
    return systemTheme;
  }

  return themeMode as "light" | "dark";
}
