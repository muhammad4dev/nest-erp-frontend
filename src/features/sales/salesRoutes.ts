import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Sales Index Route
const salesIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales",
  component: lazyRouteComponent(() =>
    import("./pages/SalesIndexPage").then((m) => ({
      default: m.SalesIndexPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:sales_order"] }, params),
});

// Sales Orders List Route
const salesOrdersListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales/orders",
  component: lazyRouteComponent(() =>
    import("./pages/SalesOrdersListPage").then((m) => ({
      default: m.SalesOrdersListPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:sales_order"] }, params),
});

// Sales Order Form Route (Create new)
const salesOrderFormRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales/orders/new",
  component: lazyRouteComponent(() =>
    import("./pages/SalesOrderFormPage").then((m) => ({
      default: m.SalesOrderFormPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["create:sales_order"] }, params),
});

// Sales Order Detail Route
const salesOrderDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales/orders/$orderId",
  component: lazyRouteComponent(() =>
    import("./pages/SalesOrderDetailPage").then((m) => ({
      default: m.SalesOrderDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:sales_order"] }, params),
});

// Invoices List Route
const invoicesListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales/invoices",
  component: lazyRouteComponent(() =>
    import("./pages/InvoicesListPage").then((m) => ({
      default: m.InvoicesListPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:invoice"] }, params),
});

// Invoice Detail Route
const invoiceDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales/invoices/$invoiceId",
  component: lazyRouteComponent(() =>
    import("./pages/InvoiceDetailPage").then((m) => ({
      default: m.InvoiceDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:invoice"] }, params),
});

// Sales Reports Route
const salesReportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "sales/reports",
  component: lazyRouteComponent(() =>
    import("./pages/SalesReportsPage").then((m) => ({
      default: m.SalesReportsPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:sales_order"] }, params),
});

export const salesRoutes = [
  salesIndexRoute,
  salesOrdersListRoute,
  salesOrderFormRoute,
  salesOrderDetailRoute,
  invoicesListRoute,
  invoiceDetailRoute,
  salesReportsRoute,
];
