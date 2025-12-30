import { createTheme } from "@mui/material";
import { arSA, enUS } from "@mui/material/locale";

import type { SupportedLanguage } from "@/lib/i18n/config";

import { componentOverrides } from "./components";
import { darkPalette, lightPalette } from "./palette";
import { createTypography } from "./typography";

type Direction = "ltr" | "rtl";
type ThemeMode = "light" | "dark";

interface ThemeOptions {
  direction: Direction;
  themeMode: ThemeMode;
  locale?: SupportedLanguage;
}

// Map supported languages to MUI locales
const muiLocaleMap = {
  en: enUS,
  ar: arSA,
} as const;

/**
 * Creates a fully configured MUI theme with:
 * - Direction-aware RTL/LTR support
 * - Light/Dark mode palettes
 * - Custom typography based on direction
 * - MUI component localization
 * - Premium component overrides
 */
export function createAppTheme({
  direction,
  themeMode,
  locale = "en",
}: ThemeOptions) {
  const palette = themeMode === "dark" ? darkPalette : lightPalette;
  const typography = createTypography(direction);
  const muiLocale = muiLocaleMap[locale] || enUS;

  return createTheme(
    {
      direction,
      palette,
      typography,
      components: componentOverrides,
      shape: {
        borderRadius: 8,
      },
      transitions: {
        easing: {
          easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
          easeOut: "cubic-bezier(0, 0, 0.2, 1)",
          easeIn: "cubic-bezier(0.4, 0, 1, 1)",
          sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
        },
        duration: {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375,
          enteringScreen: 225,
          leavingScreen: 195,
        },
      },
      spacing: 8,
    },
    muiLocale,
  );
}

// Re-export all theme utilities
export { createEmotionCache } from "./createEmotionCache";
export { componentOverrides } from "./components";
export { darkPalette, lightPalette } from "./palette";
export { createTypography } from "./typography";
