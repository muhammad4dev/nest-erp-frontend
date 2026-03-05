import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Inventory Index Route
const inventoryIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory",
  component: lazyRouteComponent(() =>
    import("./pages/InventoryIndexPage").then((m) => ({
      default: m.InventoryIndexPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Receipts List Route
const stockReceiptsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/receipts",
  component: lazyRouteComponent(() =>
    import("./pages/StockReceiptsPage").then((m) => ({
      default: m.StockReceiptsPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Receipt Detail Route
const stockReceiptDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/receipts/$receiptId",
  component: lazyRouteComponent(() =>
    import("./pages/StockReceiptDetailPage").then((m) => ({
      default: m.StockReceiptDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Issues List Route
const stockIssuesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/issues",
  component: lazyRouteComponent(() =>
    import("./pages/StockIssuesPage").then((m) => ({
      default: m.StockIssuesPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Issue Detail Route
const stockIssueDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/issues/$issueId",
  component: lazyRouteComponent(() =>
    import("./pages/StockIssueDetailPage").then((m) => ({
      default: m.StockIssueDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Transfers List Route
const stockTransfersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/stock-transfers",
  component: lazyRouteComponent(() =>
    import("./pages/StockTransfersPage").then((m) => ({
      default: m.StockTransfersPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Transfer Detail Route
const stockTransferDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/stock-transfers/$transferId",
  component: lazyRouteComponent(() =>
    import("./pages/StockTransferDetailPage").then((m) => ({
      default: m.StockTransferDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Adjustments List Route
const stockAdjustmentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/stock-adjustments",
  component: lazyRouteComponent(() =>
    import("./pages/StockAdjustmentsPage").then((m) => ({
      default: m.StockAdjustmentsPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

// Stock Adjustment Detail Route
const stockAdjustmentDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "inventory/stock-adjustments/$adjustmentId",
  component: lazyRouteComponent(() =>
    import("./pages/StockAdjustmentDetailPage").then((m) => ({
      default: m.StockAdjustmentDetailPage,
    })),
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

/**
 * Export all inventory routes as an array
 */
export const inventoryRoutes = [
  inventoryIndexRoute,
  stockReceiptsRoute,
  stockReceiptDetailRoute,
  stockIssuesRoute,
  stockIssueDetailRoute,
  stockTransfersRoute,
  stockTransferDetailRoute,
  stockAdjustmentsRoute,
  stockAdjustmentDetailRoute,
];
