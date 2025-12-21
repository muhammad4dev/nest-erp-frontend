// Re-export i18n configuration
export { default as i18n } from "./config";
export type { SupportedLanguage } from "./config";
export { supportedLanguages, defaultNS, resources } from "./config";

// Re-export i18n utilities
export { useI18nFormat } from "./useI18nFormat";

// Re-export language configuration
export type { LanguageConfig } from "./languageConfig";
export {
  languageConfig,
  getDirectionForLanguage,
  getLanguageConfig,
} from "./languageConfig";
