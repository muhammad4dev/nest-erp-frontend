import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Procurement Index Route
const procurementIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement",
  component: lazyRouteComponent(() =>
    import("./pages/ProcurementIndexPage").then((m) => ({
      default: m.ProcurementIndexPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:purchase_order"] }, params),
});

// RFQ List Route
const rfqListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/rfq",
  component: lazyRouteComponent(() =>
    import("./pages/RfqListPage").then((m) => ({ default: m.RfqListPage })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:purchase_order"] }, params),
});

// New RFQ Route
const rfqNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/rfq/new",
  component: lazyRouteComponent(() =>
    import("./pages/RfqFormPage").then((m) => ({ default: m.RfqFormPage })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["create:purchase_order"] }, params),
});

// Purchase Orders List Route
const purchaseOrdersListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/orders",
  component: lazyRouteComponent(() =>
    import("./pages/PurchaseOrdersListPage").then((m) => ({
      default: m.PurchaseOrdersListPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:purchase_order"] }, params),
});

// Purchase Order Detail Route
const purchaseOrderDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/orders/$orderId",
  component: lazyRouteComponent(() =>
    import("./pages/PurchaseOrderDetailPage").then((m) => ({
      default: m.PurchaseOrderDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:purchase_order"] }, params),
});

// Vendor Bills List Route
const vendorBillsListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/bills",
  component: lazyRouteComponent(() =>
    import("./pages/VendorBillsListPage").then((m) => ({
      default: m.VendorBillsListPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:vendor_bill"] }, params),
});

// Vendor Bill Detail Route
const vendorBillDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/bills/$billId",
  component: lazyRouteComponent(() =>
    import("./pages/VendorBillDetailPage").then((m) => ({
      default: m.VendorBillDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:vendor_bill"] }, params),
});

// AP Aging Report Route
const apAgingReportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "procurement/reports/ap-aging",
  component: lazyRouteComponent(() =>
    import("./pages/APAgingReportPage").then((m) => ({
      default: m.APAgingReportPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:vendor_bill"] }, params),
});

export const procurementRoutes = [
  procurementIndexRoute,
  rfqListRoute,
  rfqNewRoute,
  purchaseOrdersListRoute,
  purchaseOrderDetailRoute,
  vendorBillsListRoute,
  vendorBillDetailRoute,
  apAgingReportRoute,
] as const;
