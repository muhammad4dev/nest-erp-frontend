import { useMutation, useQueryClient } from "@tanstack/react-query";

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
} from "@/types/api.types";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";

/**
 * Create new user
 * POST /users
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => apiClient.post<User>("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Update existing user
 * PUT /users/:id
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      apiClient.put<User>(`/users/${id}`, data),
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
 * Assign role to user
 * POST /users/:id/roles/:roleId
 */
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.post<User>(`/users/${userId}/roles/${roleId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
    },
  });
};

/**
 * Remove role from user
 * DELETE /users/:id/roles/:roleId
 */
export const useRemoveUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
    }: {
      userId: string;
      roleId: string;
    }) => {
      await apiClient.delete(`/users/${userId}/roles/${roleId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
    },
  });
};

/**
 * Change user password
 * POST /users/:id/change-password
 */
export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      currentPassword,
      newPassword,
    }: {
      userId: string;
      currentPassword: string;
      newPassword: string;
    }) => {
      await apiClient.post(`/users/${userId}/change-password`, {
        currentPassword,
        newPassword,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
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
    mutationFn: (data: CreateRoleDto) => apiClient.post<Role>("/roles", data),
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
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      apiClient.patch<Role>(`/roles/${id}`, data),
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
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) =>
      apiClient.post<Role>(`/roles/${roleId}/permissions`, { permissionIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.roleId),
      });
    },
  });
};

/**
 * Delete role
 * DELETE /roles/:id
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
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
    mutationFn: (data: CreateTenantDto) =>
      apiClient.post<Tenant>("/tenants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
    },
  });
};

/**
 * Update existing tenant
 * put /tenants/:id
 */
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantDto }) =>
      apiClient.put<Tenant>(`/tenants/${id}`, data),
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
