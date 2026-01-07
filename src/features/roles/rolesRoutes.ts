import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Roles List Route
// Path: /app/roles
const rolesListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "roles",
  component: lazyRouteComponent(() =>
    import("./pages/RolesListPage").then((m) => ({ default: m.RolesListPage })),
  ),
  beforeLoad: ({ params }) => RouteGuard({ roles: ["ADMIN"] }, params),
});

export const rolesRoutes = [rolesListRoute] as const;
