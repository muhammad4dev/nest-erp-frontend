import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  User,
  Role,
  Tenant,
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateTenantDto,
  UpdateTenantDto,
} from '@/types/api.types';

import { apiClient } from '../client';
import { queryKeys } from '../query-keys';

/**
 * Create new user
 * POST /users
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await apiClient.post<User>('/users', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Update existing user
 * PATCH /users/:id
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const response = await apiClient.patch<User>(`/users/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
    },
  });
};

/**
 * Delete user
 * DELETE /users/:id
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Create new role
 * POST /roles
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleDto) => {
      const response = await apiClient.post<Role>('/roles', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
};

/**
 * Update existing role
 * PATCH /roles/:id
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleDto }) => {
      const response = await apiClient.patch<Role>(`/roles/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.id),
      });
    },
  });
};

/**
 * Assign permissions to role
 * POST /roles/:id/permissions
 */
export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => {
      const response = await apiClient.post<Role>(
        `/roles/${roleId}/permissions`,
        { permissionIds },
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.roleId),
      });
    },
  });
};

/**
 * Create new tenant (admin only)
 * POST /tenants
 */
export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      const response = await apiClient.post<Tenant>('/tenants', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
    },
  });
};

/**
 * Update existing tenant
 * PATCH /tenants/:id
 */
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTenantDto }) => {
      const response = await apiClient.patch<Tenant>(`/tenants/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.detail(variables.id),
      });
    },
  });
};

/**
 * Delete tenant (soft delete)
 * DELETE /tenants/:id
 */
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
    },
  });
};
