import type { Role } from "@/types/api.types";

import type { BackendPermission } from "./backend-permissions";

export type UserRole = "GUEST" | "USER" | "MANAGER" | "ADMIN";

// Use backend permission format (action:resource)
export type Permission = BackendPermission;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: Role[]; // Store full role objects from backend
  permissions: Permission[];
  token: string;
  refreshToken: string; // Refresh token for token renewal
  // Tenant context (required for multi-tenant ERP)
  tenantId: string;
  tenantName: string;
}

export interface RBACMeta {
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
}
