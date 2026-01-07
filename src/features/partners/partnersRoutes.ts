import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Partners Index Route
const partnersIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "partners",
  component: lazyRouteComponent(() =>
    import("./pages/PartnersIndexPage").then((m) => ({
      default: m.PartnersIndexPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:partner"] }, params),
});

// Partners List Route
const partnersListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "partners/list",
  component: lazyRouteComponent(() =>
    import("./pages/PartnersListPage").then((m) => ({
      default: m.PartnersListPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:partner"] }, params),
});

// New Partner Route (must come before parameterized route)
const partnerNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "partners/new",
  component: lazyRouteComponent(() =>
    import("./pages/PartnerFormPage").then((m) => ({
      default: m.PartnerFormPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["create:partner"] }, params),
});

// Partner Detail/Edit Route
const partnerDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "partners/$partnerId",
  component: lazyRouteComponent(() =>
    import("./pages/PartnerFormPage").then((m) => ({
      default: m.PartnerFormPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:partner"] }, params),
});

export const partnersRoutes = [
  partnersIndexRoute,
  partnersListRoute,
  partnerNewRoute,
  partnerDetailRoute,
] as const;
