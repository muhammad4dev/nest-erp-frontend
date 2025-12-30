/**
 * Type-safe query key factory for TanStack Query
 * Centralized query keys ensure cache consistency across the app
 */

export const queryKeys = {
  // Auth & Identity
  auth: {
    user: ["auth", "user"] as const,
    tenants: ["auth", "tenants"] as const,
  },

  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },

  roles: {
    all: ["roles"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.roles.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.roles.all, "detail", id] as const,
  },

  tenants: {
    all: ["tenants"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.tenants.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.tenants.all, "detail", id] as const,
  },

  // Finance Module
  accounts: {
    all: ["accounts"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.accounts.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.accounts.all, "detail", id] as const,
    chartOfAccounts: ["accounts", "chart"] as const,
  },

  journalEntries: {
    all: ["journal-entries"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.journalEntries.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.journalEntries.all, "detail", id] as const,
  },

  financialReports: {
    trialBalance: (startDate?: string, endDate?: string) =>
      ["reports", "trial-balance", { startDate, endDate }] as const,
    generalLedger: (accountId?: string, startDate?: string, endDate?: string) =>
      ["reports", "general-ledger", { accountId, startDate, endDate }] as const,
  },

  paymentTerms: {
    all: ["payment-terms"] as const,
    list: () => [...queryKeys.paymentTerms.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.paymentTerms.all, "detail", id] as const,
  },

  // Dashboard
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
  },
} as const;

// Type helpers for common filter types
export type UserListFilters = {
  role?: string;
  search?: string;
  isActive?: boolean;
};

export type JournalEntryListFilters = {
  startDate?: string;
  endDate?: string;
  status?: "DRAFT" | "POSTED";
};

export type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
};
