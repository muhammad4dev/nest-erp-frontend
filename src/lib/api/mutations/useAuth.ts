import { useMutation } from "@tanstack/react-query";

import { API_PATHS } from "@/config/constants";
import type { BackendPermission } from "@/lib/rbac/backend-permissions";
import type { AuthUser } from "@/lib/rbac/types";
import { useAuthStore } from "@/stores/authStore";
import type { LoginResponseDto, UserMeResponseDto } from "@/types/api.types";

import { apiClient } from "../client";

interface LoginCredentials {
  email: string;
  password: string;
  tenantId: string;
}

interface LoginResponse {
  user: AuthUser;
}

/**
 * Login mutation - connects to real NestJS backend
 * POST /auth/login
 */
export const useLogin = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<LoginResponse> => {
      // Step 1: Call /auth/login to get tokens
      const loginResponse = (await apiClient.post<LoginResponseDto>(
        API_PATHS.AUTH_LOGIN,
        { email: credentials.email, password: credentials.password },
        {
          headers: {
            "x-tenant-id": credentials.tenantId,
          },
        },
      )) as unknown as LoginResponseDto;

      // Step 2: Call /auth/me to get user data (with token in Authorization header)
      const userResponse = (await apiClient.get<UserMeResponseDto>(
        API_PATHS.AUTH_ME,
        {
          headers: {
            Authorization: `Bearer ${loginResponse.access_token}`,
            "x-tenant-id": credentials.tenantId,
          },
        },
      )) as unknown as UserMeResponseDto;

      // Transform backend response to frontend AuthUser format
      const permissions =
        userResponse.roles?.flatMap(
          (role) =>
            role.permissions?.map((p) => `${p.action}:${p.resource}`) || [],
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
        token: loginResponse.access_token,
        refreshToken: loginResponse.refresh_token,
        tenantId: userResponse.tenantId,
        tenantName: "Default Tenant",
      };

      return {
        user: authUser,
      };
    },
    onSuccess: (data) => {
      login(data.user);
    },
    onError: (error) => {
      console.error("Login failed:", error);
      throw error;
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post("/auth/logout");
      } catch (error) {
        console.warn(
          "Logout API call failed, proceeding with local logout",
          error,
        );
      }
    },
    onSuccess: () => {
      logout();
    },
  });
};
