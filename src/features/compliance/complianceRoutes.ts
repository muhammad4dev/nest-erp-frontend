import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// EInvoices Route
const eInvoicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "compliance/einvoices",
  component: lazyRouteComponent(() =>
    import("./pages/EInvoicesPage").then((m) => ({
      default: m.default,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["admin:compliance"] }, params),
});

/**
 * Export all compliance routes as an array
 */
export const complianceRoutes = [eInvoicesRoute];
