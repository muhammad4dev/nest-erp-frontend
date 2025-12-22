import type { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import React, { useLayoutEffect, useMemo } from "react";

import { createAppTheme, createEmotionCache } from "@/lib/theme";
import { useResolvedTheme } from "@/shared/hooks/useSystemTheme";
import { usePreferencesStore } from "@/stores/preferencesStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Module-level cache manager using closure - outside React's render cycle
// Creates fresh cache on each direction change with incrementing keys
// Properly flushes old cache to prevent memory leaks
const createCacheManager = () => {
  let keyCounter = 0;
  let currentCache: EmotionCache | null = null;

  return {
    refreshCache: (
      direction: "rtl" | "ltr"
    ): { cache: EmotionCache; key: number } => {
      // Flush old cache to prevent style/memory leaks
      if (currentCache) {
        currentCache.sheet.flush();
      }

      currentCache = createEmotionCache(direction);
      return {
        cache: currentCache,
        key: keyCounter++,
      };
    },
  };
};

const cacheManager = createCacheManager();

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { direction, themeMode, locale } = usePreferencesStore();

  // Resolve "system" theme mode to actual "light" or "dark"
  // This hook reactively listens to OS color scheme changes
  const resolvedThemeMode = useResolvedTheme(themeMode);

  // Get cache for current direction - refreshes on direction change
  const { cache, key } = useMemo(
    () => cacheManager.refreshCache(direction),
    [direction]
  );

  // Update document direction and attributes
  useLayoutEffect(() => {
    document.dir = direction;
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", locale);

    // Add data-theme attribute for CSS selectors
    document.documentElement.setAttribute("data-theme", resolvedThemeMode);
  }, [direction, locale, resolvedThemeMode]);

  // Create the theme with all configurations
  const theme = useMemo(
    () =>
      createAppTheme({
        direction,
        themeMode: resolvedThemeMode,
        locale,
      }),
    [direction, resolvedThemeMode, locale]
  );

  return (
    <CacheProvider value={cache}>
      {/* Key forces remount when direction changes, ensuring clean style injection */}
      <MuiThemeProvider key={key} theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};
