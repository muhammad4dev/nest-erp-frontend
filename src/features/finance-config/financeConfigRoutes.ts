import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Payment Terms Config Route
const paymentTermsConfigRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance-config/payment-terms",
  component: lazyRouteComponent(() =>
    import("./pages/PaymentTermsConfigPage").then((m) => ({
      default: m.PaymentTermsConfigPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["admin:finance"] }, params),
});

/**
 * Export all finance config routes as an array
 */
export const financeConfigRoutes = [paymentTermsConfigRoute];
