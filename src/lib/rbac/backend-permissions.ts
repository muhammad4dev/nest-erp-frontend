/**
 * Backend Permission Constants
 * These match the PERMISSIONS enum from the NestJS backend exactly
 */

export const BACKEND_PERMISSIONS = {
  // Roles Management
  ROLES: {
    CREATE: 'create:role' as const,
    READ: 'read:role' as const,
    UPDATE: 'update:role' as const,
    DELETE: 'delete:role' as const,
  },
  // Users Management
  USERS: {
    CREATE: 'create:user' as const,
    READ: 'read:user' as const,
    UPDATE: 'update:user' as const,
    DELETE: 'delete:user' as const,
  },
  // Tenants Management
  TENANTS: {
    CREATE: 'create:tenant' as const,
    READ: 'read:tenant' as const,
    UPDATE: 'update:tenant' as const,
    DELETE: 'delete:tenant' as const,
  },
  // Accounts (Finance)
  ACCOUNTS: {
    CREATE: 'create:account' as const,
    READ: 'read:account' as const,
    UPDATE: 'update:account' as const,
    DELETE: 'delete:account' as const,
  },
  // Journal Entries (Finance)
  JOURNALS: {
    CREATE: 'create:journal' as const,
    READ: 'read:journal' as const,
    POST: 'post:journal' as const,
    DELETE: 'delete:journal' as const,
  },
  // Products (Inventory)
  PRODUCTS: {
    CREATE: 'create:product' as const,
    READ: 'read:product' as const,
    UPDATE: 'update:product' as const,
    DELETE: 'delete:product' as const,
  },
  // Stock Movements (Inventory)
  STOCK: {
    CREATE: 'create:stock' as const,
    READ: 'read:stock' as const,
    ADJUST: 'adjust:stock' as const,
  },
  // Sales
  SALES: {
    CREATE: 'create:sale' as const,
    READ: 'read:sale' as const,
    UPDATE: 'update:sale' as const,
    DELETE: 'delete:sale' as const,
  },
  // Procurement
  PROCUREMENT: {
    CREATE: 'create:purchase' as const,
    READ: 'read:purchase' as const,
    UPDATE: 'update:purchase' as const,
    DELETE: 'delete:purchase' as const,
  },
  // HRMS
  HRMS: {
    CREATE: 'create:employee' as const,
    READ: 'read:employee' as const,
    UPDATE: 'update:employee' as const,
    DELETE: 'delete:employee' as const,
  },
  // POS
  POS: {
    SYNC: 'sync:pos' as const,
    READ: 'read:pos' as const,
  },
  // Compliance
  COMPLIANCE: {
    SUBMIT: 'submit:compliance' as const,
    READ: 'read:compliance' as const,
  },
  // Reports
  REPORTS: {
    TRIAL_BALANCE: 'read:trial-balance' as const,
    GENERAL_LEDGER: 'read:general-ledger' as const,
    BALANCE_SHEET: 'read:balance-sheet' as const,
    INCOME_STATEMENT: 'read:income-statement' as const,
  },
  // Legacy/Combined permissions for backward compatibility
  LEGACY: {
    VIEW_DASHBOARD: 'view:dashboard' as const,
    VIEW_ADMIN: 'view:admin' as const,
    MANAGE_USERS: 'manage:users' as const,
    MANAGE_SETTINGS: 'manage:settings' as const,
  },
} as const;

// Extract all permission values as a union type
type PermissionValues<T> = T extends Record<string, infer U>
  ? U extends Record<string, infer V>
    ? V
    : never
  : never;

// Union type of all backend permissions
export type BackendPermission = PermissionValues<typeof BACKEND_PERMISSIONS>;

// Helper to get all permissions as an array
export const getAllBackendPermissions = (): BackendPermission[] => {
  const permissions: BackendPermission[] = [];
  Object.values(BACKEND_PERMISSIONS).forEach((category) => {
    Object.values(category).forEach((permission) => {
      permissions.push(permission as BackendPermission);
    });
  });
  return permissions;
};
