import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Product Translations Route
const productTranslationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "i18n/product-translations",
  component: lazyRouteComponent(() =>
    import("./pages/ProductTranslationsPage").then((m) => ({
      default: m.default,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["admin:i18n"] }, params),
});

/**
 * Export all i18n routes as an array
 */
export const i18nRoutes = [productTranslationsRoute];
