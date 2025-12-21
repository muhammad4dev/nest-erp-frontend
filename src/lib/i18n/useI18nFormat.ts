import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { usePreferencesStore } from "@/stores/preferencesStore";

/**
 * Custom hook that provides enhanced i18n utilities including:
 * - Localized number formatting
 * - Localized date/time formatting
 * - Localized currency formatting
 * - Relative time formatting
 */
export function useI18nFormat() {
  const { i18n } = useTranslation();
  const { locale } = usePreferencesStore();

  // Get the current locale for Intl APIs
  const currentLocale = useMemo(() => {
    const localeMap: Record<string, string> = {
      en: "en-US",
      ar: "ar-SA",
    };
    return localeMap[locale] || localeMap[i18n.language] || "en-US";
  }, [locale, i18n.language]);

  // Number formatting
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLocale, options).format(value);
    },
    [currentLocale]
  );

  // Currency formatting
  const formatCurrency = useCallback(
    (
      value: number,
      currency: string = "USD",
      options?: Intl.NumberFormatOptions
    ) => {
      return new Intl.NumberFormat(currentLocale, {
        style: "currency",
        currency,
        ...options,
      }).format(value);
    },
    [currentLocale]
  );

  // Percentage formatting
  const formatPercent = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLocale, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options,
      }).format(value);
    },
    [currentLocale]
  );

  // Date formatting
  const formatDate = useCallback(
    (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions
    ): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(currentLocale, {
        dateStyle: "medium",
        ...options,
      }).format(dateObj);
    },
    [currentLocale]
  );

  // Time formatting
  const formatTime = useCallback(
    (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions
    ): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(currentLocale, {
        timeStyle: "short",
        ...options,
      }).format(dateObj);
    },
    [currentLocale]
  );

  // Date and Time formatting
  const formatDateTime = useCallback(
    (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions
    ): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(currentLocale, {
        dateStyle: "medium",
        timeStyle: "short",
        ...options,
      }).format(dateObj);
    },
    [currentLocale]
  );

  // Relative time formatting (e.g., "2 days ago", "in 3 hours")
  const formatRelativeTime = useCallback(
    (date: Date | string | number): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor(
        (dateObj.getTime() - now.getTime()) / 1000
      );

      const rtf = new Intl.RelativeTimeFormat(currentLocale, {
        numeric: "auto",
      });

      const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
        [31536000, "year"],
        [2592000, "month"],
        [604800, "week"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
        [1, "second"],
      ];

      for (const [seconds, unit] of intervals) {
        const value = Math.floor(Math.abs(diffInSeconds) / seconds);
        if (value >= 1) {
          return rtf.format(diffInSeconds > 0 ? value : -value, unit);
        }
      }

      return rtf.format(0, "second");
    },
    [currentLocale]
  );

  // List formatting (e.g., "A, B, and C")
  const formatList = useCallback(
    (items: string[], options?: Intl.ListFormatOptions): string => {
      return new Intl.ListFormat(currentLocale, {
        style: "long",
        type: "conjunction",
        ...options,
      }).format(items);
    },
    [currentLocale]
  );

  return {
    locale: currentLocale,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatList,
  };
}
