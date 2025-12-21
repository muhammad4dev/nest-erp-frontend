import type { SupportedLanguage } from "./config";

export interface LanguageConfig {
  nativeName: string;
  englishName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

/**
 * Language configuration with native names, English names, flags, and text direction.
 * Used for locale switching and RTL/LTR detection.
 */
export const languageConfig: Record<SupportedLanguage, LanguageConfig> = {
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

/**
 * Gets the text direction for a given language.
 * Defaults to "ltr" if language is not found.
 */
export function getDirectionForLanguage(lang: string): "ltr" | "rtl" {
  const config = languageConfig[lang as SupportedLanguage];
  return config?.direction ?? "ltr";
}

/**
 * Gets the full language configuration for a given language.
 * Returns English config if language is not found.
 */
export function getLanguageConfig(lang: string): LanguageConfig {
  const config = languageConfig[lang as SupportedLanguage];
  return config ?? languageConfig.en;
}
