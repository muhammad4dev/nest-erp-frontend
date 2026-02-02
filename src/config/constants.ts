import type { SupportedLanguage } from "@/lib/i18n/config";

export const APP_CONFIG = {
  name: "Enterprise React App",
  defaultLanguage:
    (localStorage.getItem("app_locale") as SupportedLanguage) ||
    ("en" as SupportedLanguage),
  defaultDirection: "ltr" as "ltr" | "rtl",
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
} as const;

export const API_PATHS = {
  AUTH_LOGIN: "/auth/login",
  AUTH_ME: "/auth/me",
  AUTH_REFRESH: "/auth/refresh",
  USERS: "/users",
  TENANTS: "/tenants",
} as const;

export const STORAGE_KEYS = {
  AUTH: "auth",
  USER_PREFERENCES: "user_preferences",
} as const;

export const THEME_MODE = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export const ROUTES = {
  ROOT: "/",
  APP: "/$lang/app",
  LOGIN: "/$lang/login",
  DASHBOARD: "/$lang/app",
  FORBIDDEN: "/$lang/forbidden",
} as const;
