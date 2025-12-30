import { useMutation } from '@tanstack/react-query';

import type { BackendPermission } from '@/lib/rbac/backend-permissions';
import type { AuthUser } from '@/lib/rbac/types';
import { useAuthStore } from '@/stores/authStore';
import type { LoginResponseDto } from '@/types/api.types';

import { apiClient } from '../client';

interface LoginCredentials {
  email: string;
  password: string;
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
      // Call real backend API (response.data is returned directly due to interceptor)
      const response = (await apiClient.post<LoginResponseDto>(
        '/auth/login',
        credentials,
      )) as unknown as LoginResponseDto;

      // Transform backend response to frontend AuthUser format
      const backendUser = response.user;
      const permissions =
        backendUser.roles?.flatMap(
          (role) =>
            role.permissions?.map((p) => `${p.action}:${p.resource}`) || [],
        ) || [];

      const authUser: AuthUser = {
        id: backendUser.id,
        name: backendUser.email.split('@')[0],
        email: backendUser.email,
        role: 'USER',
        permissions: permissions as BackendPermission[],
        token: response.access_token,
        tenantId: backendUser.tenantId,
        tenantName: 'Default Tenant',
      };

      return {
        user: authUser,
      };
    },
    onSuccess: (data) => {
      login(data.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
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
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.warn(
          'Logout API call failed, proceeding with local logout',
          error,
        );
      }
    },
    onSuccess: () => {
      logout();
    },
  });
};
