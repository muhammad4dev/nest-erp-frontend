import {
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { APP_CONFIG } from "@/config/constants";
import i18n, {
  supportedLanguages,
  type SupportedLanguage,
} from "@/lib/i18n/config";
import { getDirectionForLanguage } from "@/lib/i18n/languageConfig";
import { AppLayout } from "@/shared/components/layouts/AppLayout";
import { PublicLayout } from "@/shared/components/layouts/PublicLayout";
import { NetworkStatus } from "@/shared/components/ui/NetworkStatus";
import { NotificationManager } from "@/shared/components/ui/NotificationManager";
import { NotificationToast } from "@/shared/components/ui/NotificationToast";
import { PWAInstallPrompt } from "@/shared/components/ui/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/shared/components/ui/PWAUpdatePrompt";
import { usePreferencesStore } from "@/stores/preferencesStore";

import { RouteGuard } from "./routeGuard";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <NetworkStatus />
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
      <NotificationToast />
      <NotificationManager />
    </>
  ),
});

// Language Wrapper Route
// VALIDATES the 'lang' param. If invalid, redirects to default 'en'.
// Also syncs i18n language and text direction with URL param.
export const langRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$lang",
  component: Outlet,
  params: {
    parse: (params) => ({ lang: params.lang as SupportedLanguage }),
    stringify: (params) => ({ lang: params.lang }),
  },
  beforeLoad: ({ params, location }) => {
    const lang = params.lang;
    if (!supportedLanguages.includes(lang)) {
      // If the language param is invalid, we assume the user omitted the language
      // and is trying to access a route directly (e.g. /app/dashboard).
      // We redirect to the default language version of the current path.
      throw redirect({
        // @ts-expect-error - Dynamic redirect path fallback
        to: `/${APP_CONFIG.defaultLanguage}${location.pathname}`,
        replace: true,
      });
    }

    // Sync i18n with URL param
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }

    // Sync direction with URL language
    const direction = getDirectionForLanguage(lang);
    const preferencesStore = usePreferencesStore.getState();

    if (preferencesStore.direction !== direction) {
      preferencesStore.setDirection(direction);
    }

    if (preferencesStore.locale !== lang) {
      preferencesStore.setLocale(lang as "en" | "ar");
    }

    // Update document direction immediately
    document.dir = direction;
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", lang);
  },
});

export const publicRoute = createRoute({
  getParentRoute: () => langRoute,
  id: "public",
  component: PublicLayout,
});

export const appRoute = createRoute({
  getParentRoute: () => langRoute,
  path: "/app", // This becomes /:lang/app
  component: AppLayout,
  beforeLoad: ({ params }) => RouteGuard({ requiresAuth: true }, params),
});
