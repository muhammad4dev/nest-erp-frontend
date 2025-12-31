import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// Products Index Route
const productsIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products",
  component: lazyRouteComponent(() =>
    import("./pages/ProductsIndexPage").then((m) => ({
      default: m.ProductsIndexPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:product"] }, params),
});

// Products List Route
const productsListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products/list",
  component: lazyRouteComponent(() =>
    import("./pages/ProductsListPage").then((m) => ({
      default: m.ProductsListPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:product"] }, params),
});

// New Product Route (must come before parameterized route)
const productNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products/new",
  component: lazyRouteComponent(() =>
    import("./pages/ProductFormPage").then((m) => ({
      default: m.ProductFormPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["create:product"] }, params),
});

// Product Detail/Edit Route
const productDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products/$productId",
  component: lazyRouteComponent(() =>
    import("./pages/ProductFormPage").then((m) => ({
      default: m.ProductFormPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:product"] }, params),
});

// Categories Route
const categoriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products/categories",
  component: lazyRouteComponent(() =>
    import("./pages/CategoriesPage").then((m) => ({
      default: m.CategoriesPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:product"] }, params),
});

// Attributes Route
const attributesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products/attributes",
  component: lazyRouteComponent(() =>
    import("./pages/AttributesPage").then((m) => ({
      default: m.AttributesPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:product"] }, params),
});

// Stock Management Route
const stockRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "products/stock",
  component: lazyRouteComponent(() =>
    import("./pages/StockPage").then((m) => ({
      default: m.StockPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ permissions: ["read:stock"] }, params),
});

export const productsRoutes = [
  productsIndexRoute,
  productsListRoute,
  productNewRoute,
  productDetailRoute,
  categoriesRoute,
  attributesRoute,
  stockRoute,
] as const;
