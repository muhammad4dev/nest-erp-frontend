import type { ThemeOptions } from "@mui/material";

// LTR fonts - Modern, clean typefaces
const LTR_FONT_FAMILY =
  '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif';

// RTL fonts - High-quality Arabic fonts with Latin fallbacks
const RTL_FONT_FAMILY =
  '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Tajawal", Arial, sans-serif';

/**
 * Creates typography options based on text direction.
 * Uses Inter for LTR (modern, highly legible) and IBM Plex Sans Arabic for RTL.
 */
export function createTypography(
  direction: "rtl" | "ltr"
): ThemeOptions["typography"] {
  const fontFamily = direction === "rtl" ? RTL_FONT_FAMILY : LTR_FONT_FAMILY;

  return {
    fontFamily,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.005em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.57,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none", // Modern approach: no uppercase buttons
      letterSpacing: "0.02em",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: "0.625rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  };
}
