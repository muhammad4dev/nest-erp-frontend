import { useQuery } from '@tanstack/react-query';

import type { User, Role, Tenant, PaginatedResponse } from '@/types/api.types';

import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { UserListFilters } from '../query-keys';

/**
 * Fetch list of users with optional filters
 * GET /users
 */
export const useUsers = (filters?: UserListFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>('/users', {
        params: filters,
      });
      return response;
    },
  });
};

/**
 * Fetch single user by ID
 * GET /users/:id
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Fetch list of roles
 * GET /roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: async () => {
      const response = await apiClient.get<Role[]>('/roles');
      return response;
    },
  });
};

/**
 * Fetch single role by ID with permissions
 * GET /roles/:id
 */
export const useRole = (id: string) => {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Role>(`/roles/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Fetch list of tenants (admin only)
 * GET /tenants
 */
export const useTenants = () => {
  return useQuery({
    queryKey: queryKeys.tenants.all,
    queryFn: async () => {
      const response = await apiClient.get<Tenant[]>('/tenants');
      return response;
    },
  });
};

/**
 * Fetch single tenant by ID
 * GET /tenants/:id
 */
export const useTenant = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Tenant>(`/tenants/${id}`);
      return response;
    },
    enabled: !!id,
  });
};
