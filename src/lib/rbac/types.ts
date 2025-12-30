import type { BackendPermission } from "./backend-permissions";

export type UserRole = "GUEST" | "USER" | "MANAGER" | "ADMIN";

// Use backend permission format (action:resource)
export type Permission = BackendPermission;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  token: string;
  // Tenant context (required for multi-tenant ERP)
  tenantId: string;
  tenantName: string;
}

export interface RBACMeta {
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
}
