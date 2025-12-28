import { ROUTES } from "@/config/constants";
import { canAccess } from "@/lib/rbac/guards";
import type { UserRole, Permission } from "@/lib/rbac/types";
import { useAuthStore } from "@/stores/authStore";

import { appRedirect } from "./utils";

type RouteGuardConfig = {
  requiresAuth?: boolean;
  roles?: UserRole[];
  permissions?: Permission[];
};

export async function RouteGuard(
  config: RouteGuardConfig,
  params: { lang: string }
) {
  // Ensure store is hydrated from localStorage before checking auth
  await useAuthStore.persist.rehydrate();

  const { user, isAuthenticated } = useAuthStore.getState();
  const requiresAuth = config.requiresAuth ?? true;

  if (requiresAuth && !isAuthenticated) {
    throw appRedirect({ to: ROUTES.LOGIN }, params);
  }

  if (
    !canAccess(user, {
      requiresAuth,
      allowedRoles: config.roles,
      requiredPermissions: config.permissions,
    })
  ) {
    throw appRedirect({ to: ROUTES.FORBIDDEN }, params);
  }
}
