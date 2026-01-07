import { useQuery } from "@tanstack/react-query";

import type { User, Role, Tenant, Permission } from "@/types/api.types";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";
import type { UserListFilters } from "../query-keys";

/**
 * Fetch list of users with optional filters
 * GET /users
 */
export const useUsers = (filters?: UserListFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () =>
      apiClient.get<User[]>("/users", {
        params: filters,
      }),
  });
};

/**
 * Fetch single user by ID
 * GET /users/:id
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiClient.get<User>(`/users/${id}`),
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
    queryFn: () => apiClient.get<Role[]>("/roles"),
  });
};

/**
 * Fetch single role by ID with permissions
 * GET /roles/:id
 */
export const useRole = (id: string) => {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => apiClient.get<Role>(`/roles/${id}`),
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
    queryFn: () => apiClient.get<Tenant[]>("/tenants"),
  });
};

/**
 * Fetch all available permissions
 * GET /roles/permissions/list
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => apiClient.get<Permission[]>("/roles/permissions/list"),
  });
};

/**
 * Fetch single tenant by ID
 * GET /tenants/:id
 */
export const useTenant = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => apiClient.get<Tenant>(`/tenants/${id}`),
    enabled: !!id,
  });
};
