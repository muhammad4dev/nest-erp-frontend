import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// POS Route
const posRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "pos",
  component: lazyRouteComponent(() =>
    import("./pages/POSPage").then((m) => ({
      default: m.POSPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["sync:pos"] }, params),
});

export const posRoutes = [posRoute];
