import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton, Tooltip } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { THEME_MODE } from "@/config/constants";
import { useResolvedTheme } from "@/shared/hooks/useSystemTheme";
import { usePreferencesStore } from "@/stores/preferencesStore";

type ThemeModeType = (typeof THEME_MODE)[keyof typeof THEME_MODE];

// Cycle order: Light → Dark → System → Light
const THEME_CYCLE: ThemeModeType[] = [
  THEME_MODE.LIGHT,
  THEME_MODE.DARK,
  THEME_MODE.SYSTEM,
];

export const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = usePreferencesStore();
  const resolvedTheme = useResolvedTheme(themeMode);

  // Cycle to next theme mode
  const handleToggle = useCallback(() => {
    const currentIndex = THEME_CYCLE.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setThemeMode(THEME_CYCLE[nextIndex]);
  }, [themeMode, setThemeMode]);

  // Get tooltip and aria-label for current mode
  const tooltipText = useMemo(() => {
    switch (themeMode) {
      case THEME_MODE.LIGHT:
        return t("common.darkMode", "Dark Mode");
      case THEME_MODE.DARK:
        return t("common.systemMode", "System Mode");
      case THEME_MODE.SYSTEM:
        return t("common.lightMode", "Light Mode");
      default:
        return t("common.toggleTheme", "Toggle Theme");
    }
  }, [themeMode, t]);

  // Get the appropriate icon based on current mode
  const ThemeIcon = useMemo(() => {
    if (themeMode === THEME_MODE.SYSTEM) {
      return BrightnessAutoIcon;
    }
    return resolvedTheme === "dark" ? DarkModeIcon : LightModeIcon;
  }, [themeMode, resolvedTheme]);

  return (
    <Tooltip title={tooltipText}>
      <IconButton
        color="inherit"
        onClick={handleToggle}
        aria-label={tooltipText}
        sx={{
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "rotate(30deg)",
          },
        }}
      >
        <ThemeIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
