import { create } from "zustand";
import { persist } from "zustand/middleware";

import { APP_CONFIG, STORAGE_KEYS, THEME_MODE } from "@/config/constants";

type Locale = typeof APP_CONFIG.defaultLanguage;
type Direction = typeof APP_CONFIG.defaultDirection;
type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];

interface PreferencesState {
  locale: Locale;
  direction: Direction;
  themeMode: ThemeMode;
  setLocale: (locale: Locale) => void;
  setDirection: (dir: Direction) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: APP_CONFIG.defaultLanguage as Locale,
      direction: APP_CONFIG.defaultDirection as Direction,
      // Default to SYSTEM mode - the app will reactively follow OS preference
      themeMode: THEME_MODE.SYSTEM as ThemeMode,
      setLocale: (locale) => set({ locale }),
      setDirection: (direction) => set({ direction }),
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleTheme: () =>
        set((state) => ({
          themeMode:
            state.themeMode === THEME_MODE.LIGHT
              ? THEME_MODE.DARK
              : THEME_MODE.LIGHT,
        })),
    }),
    {
      name: STORAGE_KEYS.USER_PREFERENCES,
      partialize: (state) => ({
        themeMode: state.themeMode,
        locale: state.locale,
        direction: state.direction,
      }),
    }
  )
);
