# MUI RTL, i18n, and Theme System Guide

This guide explains how the RTL (Right-to-Left), internationalization (i18n), and theming systems work together in this application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [RTL Support](#rtl-support)
4. [Theme System](#theme-system)
5. [Internationalization (i18n)](#internationalization-i18n)
6. [Locale Switching](#locale-switching)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

The application supports:

- **RTL/LTR layouts** - Arabic (RTL) and English (LTR)
- **Dark/Light/System themes** - With reactive OS preference detection
- **MUI component localization** - Native Arabic translations for MUI components
- **i18n translations** - Using react-i18next

### Key Technologies

- `@emotion/react` + `@emotion/cache` - CSS-in-JS styling
- `@mui/stylis-plugin-rtl` - Automatic RTL CSS transformation
- `react-i18next` - Translation management
- `zustand` - State management for preferences

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ThemeProvider                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ CacheProvider   │  │ MuiThemeProvider│  │ CssBaseline │  │
│  │ (RTL cache)     │  │ (theme + locale)│  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    usePreferencesStore                      │
│  ┌─────────┐  ┌───────────┐  ┌──────────┐                   │
│  │ locale  │  │ direction │  │themeMode │                   │
│  │ "ar"    │  │ "rtl"     │  │ "system" │                   │
│  └─────────┘  └───────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## RTL Support

### How It Works

1. **Emotion Cache with RTL Plugin** (`src/lib/theme/createEmotionCache.ts`)

```typescript
import createCache from "@emotion/cache";
import rtlPlugin from "@mui/stylis-plugin-rtl";

export function createEmotionCache(direction: "rtl" | "ltr") {
  const plugins = direction === "rtl" ? [rtlPlugin] : [];

  return createCache({
    key: direction === "rtl" ? "muirtl" : "muiltr",
    stylisPlugins: plugins,
    prepend: true,
  });
}
```

The `@mui/stylis-plugin-rtl` automatically transforms CSS:

- `left: 10px` → `right: 10px`
- `margin-left: 20px` → `margin-right: 20px`
- `text-align: left` → `text-align: right`
- etc.

2. **Cache Management** (`src/app/providers/ThemeProvider.tsx`)

```typescript
// Module-level cache manager using closure
const createCacheManager = () => {
  let keyCounter = 0;

  return {
    refreshCache: (direction: "rtl" | "ltr") => ({
      cache: createEmotionCache(direction),
      key: keyCounter++,
    }),
  };
};

const cacheManager = createCacheManager();
```

**Why increment keys?** Each direction change creates a fresh cache with a new key. This forces React to remount the `MuiThemeProvider`, ensuring all styles are re-injected cleanly.

3. **Document Direction Sync**

```typescript
useLayoutEffect(() => {
  document.dir = direction;
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", locale);
}, [direction, locale]);
```

### ⚠️ Important: Don't Manually Flip for RTL!

When using `@mui/stylis-plugin-rtl`, **do NOT manually switch directional props**:

```tsx
// ❌ WRONG - The RTL plugin will flip this back!
<Drawer anchor={isRTL ? "right" : "left"} />

// ✅ CORRECT - Let the plugin handle flipping
<Drawer anchor="left" />
```

The plugin automatically transforms `left` → `right` in RTL mode.

---

## Theme System

### File Structure

```
src/lib/theme/
├── index.ts              # Main theme factory
├── createEmotionCache.ts # RTL/LTR cache creation
├── palette.ts            # Light/dark color palettes
├── typography.ts         # Direction-aware typography
└── components.ts         # MUI component overrides
```

### Creating the Theme (`src/lib/theme/index.ts`)

```typescript
import { createTheme } from "@mui/material";
import { arSA, enUS } from "@mui/material/locale";

const muiLocaleMap = {
  en: enUS,
  ar: arSA,
} as const;

export function createAppTheme({ direction, themeMode, locale }) {
  const palette = themeMode === "dark" ? darkPalette : lightPalette;
  const typography = createTypography(direction);
  const muiLocale = muiLocaleMap[locale] || enUS;

  return createTheme(
    {
      direction,
      palette,
      typography,
      components: componentOverrides,
    },
    muiLocale, // ← Second argument for MUI translations
  );
}
```

### Direction-Aware Typography (`src/lib/theme/typography.ts`)

```typescript
const LTR_FONT_FAMILY = '"Inter", "Roboto", sans-serif';
const RTL_FONT_FAMILY =
  '"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif';

export function createTypography(direction: "rtl" | "ltr") {
  const fontFamily = direction === "rtl" ? RTL_FONT_FAMILY : LTR_FONT_FAMILY;

  return {
    fontFamily,
    h1: { fontWeight: 700, fontSize: "2.5rem" },
    // ... other variants
  };
}
```

### Theme Modes

The app supports three theme modes:

| Mode     | Description                      |
| -------- | -------------------------------- |
| `light`  | Always use light theme           |
| `dark`   | Always use dark theme            |
| `system` | Follow OS preference (reactive!) |

**System Mode Implementation** (`src/shared/hooks/useSystemTheme.ts`):

```typescript
export function useSystemTheme(): "light" | "dark" {
  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return systemTheme;
}

export function useResolvedTheme(themeMode: ThemeMode): "light" | "dark" {
  const systemTheme = useSystemTheme();
  return themeMode === "system" ? systemTheme : themeMode;
}
```

---

## Internationalization (i18n)

### Configuration (`src/lib/i18n/config.ts`)

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en.json";
import arCommon from "./locales/ar.json";

export const resources = {
  en: { common: enCommon },
  ar: { common: arCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
```

### Language Configuration (`src/lib/i18n/languageConfig.ts`)

```typescript
export const languageConfig = {
  en: {
    nativeName: "English",
    englishName: "English",
    flag: "🇺🇸",
    direction: "ltr",
  },
  ar: {
    nativeName: "العربية",
    englishName: "Arabic",
    flag: "🇸🇦",
    direction: "rtl",
  },
};

export function getDirectionForLanguage(lang: string): "ltr" | "rtl" {
  return languageConfig[lang]?.direction ?? "ltr";
}
```

### Translation Files

**English (`src/lib/i18n/locales/en.json`)**:

```json
{
  "app": {
    "title": "Enterprise React Stack"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "lightMode": "Light Mode",
    "darkMode": "Dark Mode",
    "systemMode": "System Mode"
  }
}
```

**Arabic (`src/lib/i18n/locales/ar.json`)**:

```json
{
  "app": {
    "title": "مجموعة رياكت للمؤسسات"
  },
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "lightMode": "الوضع الفاتح",
    "darkMode": "الوضع الداكن",
    "systemMode": "وضع النظام"
  }
}
```

### Using Translations

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <Button>{t("common.save")}</Button>;
}
```

### Advanced Formatting (`src/lib/i18n/useI18nFormat.ts`)

```typescript
const { formatNumber, formatCurrency, formatDate, formatRelativeTime } =
  useI18nFormat();

formatCurrency(1234.56, "USD"); // "$1,234.56" or "١٬٢٣٤٫٥٦ US$"
formatDate(new Date()); // "Dec 30, 2025" or "٣٠ ديسمبر ٢٠٢٥"
formatRelativeTime(pastDate); // "2 days ago" or "منذ يومين"
```

---

## Locale Switching

### Router-Based Language (`src/app/router/layouts.tsx`)

The language is determined by the URL parameter `/:lang/`:

```typescript
export const langRoute = createRoute({
  path: "$lang",
  beforeLoad: ({ params }) => {
    const lang = params.lang;

    // Sync i18n
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }

    // Sync direction
    const direction = getDirectionForLanguage(lang);
    const store = usePreferencesStore.getState();

    if (store.direction !== direction) {
      store.setDirection(direction);
    }

    // Update document
    document.dir = direction;
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", lang);
  },
});
```

### LocaleSwitcher Component (`src/shared/components/ui/LocaleSwitcher.tsx`)

```tsx
const changeLanguage = useCallback(
  (lang: SupportedLanguage) => {
    const config = languageConfig[lang];

    setLocale(lang);
    setDirection(config.direction);

    navigate({
      to: ".",
      params: { lang },
      replace: true,
    });
  },
  [navigate, setLocale, setDirection],
);
```

---

## Common Issues & Solutions

### 1. Styles Lost When Switching Languages

**Problem**: All styles disappear when switching between RTL/LTR.

**Solution**: Use a key-based remount strategy with fresh cache per direction:

```tsx
const { cache, key } = useMemo(
  () => cacheManager.refreshCache(direction),
  [direction]
);

<MuiThemeProvider key={key} theme={theme}>
```

### 2. Drawer Opens on Wrong Side in RTL

**Problem**: Drawer appears on left in RTL instead of right.

**Solution**: Don't manually flip `anchor` - let the RTL plugin handle it:

```tsx
// Let the plugin flip automatically
<Drawer anchor="left" />
```

### 3. API Requests Cached by Service Worker

**Problem**: SSE streams and API calls are being cached.

**Solution**: Add NetworkOnly route in service worker:

```typescript
registerRoute(({ url }) => url.pathname.startsWith("/api/"), new NetworkOnly());
```

### 4. Fonts Not Loading for Arabic

**Problem**: Arabic text uses wrong font.

**Solution**: Import Arabic fonts in `index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### 5. MUI Components Show English in Arabic Mode

**Problem**: MUI's internal text (pagination, etc.) is in English.

**Solution**: Pass locale to `createTheme`:

```typescript
import { arSA, enUS } from "@mui/material/locale";

createTheme(themeConfig, muiLocale);
```

---

## Quick Reference

### Dependencies

```bash
pnpm add @emotion/cache @emotion/react @mui/stylis-plugin-rtl stylis i18next react-i18next i18next-browser-languagedetector
```

### Key Files

| File                                  | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `src/app/providers/ThemeProvider.tsx` | Main theme provider with RTL cache          |
| `src/lib/theme/index.ts`              | Theme factory                               |
| `src/lib/theme/createEmotionCache.ts` | RTL/LTR cache creation                      |
| `src/lib/i18n/config.ts`              | i18n configuration                          |
| `src/lib/i18n/languageConfig.ts`      | Language metadata                           |
| `src/stores/preferencesStore.ts`      | User preferences (locale, direction, theme) |
| `src/shared/hooks/useSystemTheme.ts`  | Reactive system theme detection             |

### URL Structure

```
/en/app/dashboard  → English, LTR
/ar/app/dashboard  → Arabic, RTL
```

---

## Adding a New Language

1. **Add language config** (`src/lib/i18n/languageConfig.ts`):

```typescript
export const languageConfig = {
  // ...existing
  fr: {
    nativeName: "Français",
    englishName: "French",
    flag: "🇫🇷",
    direction: "ltr",
  },
};
```

2. **Add translations** (`src/lib/i18n/locales/fr.json`)

3. **Register in i18n** (`src/lib/i18n/config.ts`):

```typescript
import frCommon from "./locales/fr.json";

export const resources = {
  en: { common: enCommon },
  ar: { common: arCommon },
  fr: { common: frCommon },
};
```

4. **Add MUI locale** (`src/lib/theme/index.ts`):

```typescript
import { frFR } from "@mui/material/locale";

const muiLocaleMap = {
  en: enUS,
  ar: arSA,
  fr: frFR,
};
```

5. **Update supported languages** (`src/lib/i18n/config.ts`):

```typescript
export const supportedLanguages = ["en", "ar", "fr"] as const;
```
