import type { PaletteOptions } from "@mui/material";

/**
 * Premium color palette with carefully curated colors.
 * Uses HSL-based colors for better harmony and consistency.
 */
export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#3B82F6", // Modern blue
    light: "#60A5FA",
    dark: "#2563EB",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#8B5CF6", // Vibrant purple
    light: "#A78BFA",
    dark: "#7C3AED",
    contrastText: "#FFFFFF",
  },
  error: {
    main: "#EF4444",
    light: "#F87171",
    dark: "#DC2626",
  },
  warning: {
    main: "#F59E0B",
    light: "#FBBF24",
    dark: "#D97706",
  },
  info: {
    main: "#06B6D4",
    light: "#22D3EE",
    dark: "#0891B2",
  },
  success: {
    main: "#10B981",
    light: "#34D399",
    dark: "#059669",
  },
  background: {
    default: "#F8FAFC",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
  },
  divider: "rgba(0, 0, 0, 0.08)",
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#60A5FA", // Lighter blue for dark mode
    light: "#93C5FD",
    dark: "#3B82F6",
    contrastText: "#0F172A",
  },
  secondary: {
    main: "#A78BFA", // Lighter purple for dark mode
    light: "#C4B5FD",
    dark: "#8B5CF6",
    contrastText: "#0F172A",
  },
  error: {
    main: "#F87171",
    light: "#FCA5A5",
    dark: "#EF4444",
  },
  warning: {
    main: "#FBBF24",
    light: "#FCD34D",
    dark: "#F59E0B",
  },
  info: {
    main: "#22D3EE",
    light: "#67E8F9",
    dark: "#06B6D4",
  },
  success: {
    main: "#34D399",
    light: "#6EE7B7",
    dark: "#10B981",
  },
  background: {
    default: "#0F172A",
    paper: "#1E293B",
  },
  text: {
    primary: "#F1F5F9",
    secondary: "#94A3B8",
  },
  divider: "rgba(255, 255, 255, 0.08)",
};
