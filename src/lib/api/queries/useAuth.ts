import { useQuery } from "@tanstack/react-query";

import { API_PATHS } from "@/config/constants";
import type { BackendPermission } from "@/lib/rbac/backend-permissions";
import type { AuthUser } from "@/lib/rbac/types";
import { useAuthStore } from "@/stores/authStore";
import type { UserMeResponseDto } from "@/types/api.types";

import { apiClient } from "../client";

/**
 * Fetch current user data from /auth/me
 * GET /auth/me
 */
export const useMe = () => {
  const { user: currentUser, login } = useAuthStore();
  const isAuthenticated = !!currentUser;

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<AuthUser> => {
      const userResponse = await apiClient.get<UserMeResponseDto>(
        API_PATHS.AUTH_ME
      );

      // Transform backend response to frontend AuthUser format
      const permissions =
        userResponse.roles?.flatMap(
          (role) =>
            role.permissions?.map((p) => `${p.action}:${p.resource}`) || []
        ) || [];

      // Determine primary role (use highest privilege role)
      const rolePriority: Record<string, number> = {
        admin: 3,
        manager: 2,
        user: 1,
      };

      const primaryRole = userResponse.roles?.reduce((highest, role) => {
        const currentPriority = rolePriority[role.name.toLowerCase()] || 0;
        const highestPriority = rolePriority[highest.toLowerCase()] || 0;
        return currentPriority > highestPriority ? role.name : highest;
      }, "user");

      const authUser: AuthUser = {
        id: userResponse.id,
        name: userResponse.email.split("@")[0],
        email: userResponse.email,
        role: (primaryRole?.toUpperCase() as AuthUser["role"]) || "USER",
        roles: userResponse.roles || [],
        permissions: permissions as BackendPermission[],
        token: currentUser?.token || "",
        refreshToken: currentUser?.refreshToken || "", // Preserve existing refresh token
        tenantId: userResponse.tenantId,
        tenantName: currentUser?.tenantName || "Default Tenant",
      };

      // Update store with fresh user data (preserves tokens)
      login(authUser);

      return authUser;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return query;
};
