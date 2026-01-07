import {
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";

import { ROUTES } from "@/config/constants";
import { NotFound } from "@/shared/components/NotFound";
import { useAuthStore } from "@/stores/authStore";

import { appRoutes } from "./appRoutes";
import { rootRoute, langRoute, publicRoute, appRoute } from "./layouts";
import { appRedirect } from "./utils";

// Ensure Zustand store is hydrated from localStorage before checking auth state
const ensureAuthHydrated = async () => {
  const store = useAuthStore;
  // Wait for persist to rehydrate
  await store.persist.rehydrate();
};

// Root index redirect (e.g. localhost:3000/ -> localhost:3000/en/login)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    await ensureAuthHydrated();
    const { isAuthenticated } = useAuthStore.getState();
    throw appRedirect({
      to: isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN,
    });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "login",
  component: lazyRouteComponent(() =>
    import("@/features/auth/pages/LoginPage").then((m) => ({
      default: m.LoginPage,
    })),
  ),
  beforeLoad: async ({ params }) => {
    await ensureAuthHydrated();
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw appRedirect({ to: ROUTES.DASHBOARD }, params);
    }
  },
});

const forbiddenRoute = createRoute({
  getParentRoute: () => langRoute,
  path: "forbidden",
  component: lazyRouteComponent(() =>
    import("@/features/forbidden/ForbiddenPage").then((m) => ({
      default: m.ForbiddenPage,
    })),
  ),
});

// Assemble route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  langRoute.addChildren([
    publicRoute.addChildren([loginRoute]),
    appRoute.addChildren(appRoutes),
    forbiddenRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: NotFound,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
