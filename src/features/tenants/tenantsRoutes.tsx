import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Tenants List Route
// Path: /app/tenants
const tenantsListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "tenants",
  component: lazyRouteComponent(() =>
    import("./pages/TenantsListPage").then((m) => ({
      default: m.TenantsListPage,
    })),
  ),
  beforeLoad: ({ params }) => RouteGuard({ roles: ["ADMIN"] }, params),
});

// Tenant Detail Route
// Path: /app/tenants/:id
const tenantDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "tenants/$id",
  component: lazyRouteComponent(() =>
    import("./pages/TenantDetailPage").then((m) => ({
      default: m.TenantDetailPage,
    })),
  ),
  beforeLoad: ({ params }) => RouteGuard({ roles: ["ADMIN"] }, params),
});

// Tenant Create Route
// Path: /app/tenants/new
const tenantCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "tenants/new",
  component: lazyRouteComponent(() =>
    import("./pages/TenantFormPage").then((m) => ({
      default: m.TenantFormPage,
    })),
  ),
  beforeLoad: ({ params }) => RouteGuard({ roles: ["ADMIN"] }, params),
});

// Tenant Edit Route
// Path: /app/tenants/:id/edit
const tenantEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "tenants/$id/edit",
  component: lazyRouteComponent(() =>
    import("./pages/TenantFormPage").then((m) => ({
      default: m.TenantFormPage,
    })),
  ),
  beforeLoad: ({ params }) => RouteGuard({ roles: ["ADMIN"] }, params),
});

export const tenantsRoutes = [
  tenantsListRoute,
  tenantCreateRoute,
  tenantEditRoute,
  tenantDetailRoute,
] as const;
