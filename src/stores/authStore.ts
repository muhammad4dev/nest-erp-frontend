import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/config/constants";
import type { AuthUser } from "@/lib/rbac/types";
import type { Tenant } from "@/types/api.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  availableTenants: Tenant[];
  selectedTenantId: string | null;

  // Actions
  login: (user: AuthUser) => void;
  logout: () => void;
  updateToken: (token: string) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setAvailableTenants: (tenants: Tenant[]) => void;
  selectTenant: (tenantId: string, tenantName: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      availableTenants: [],
      selectedTenantId: null,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          selectedTenantId: user.tenantId,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          availableTenants: [],
          selectedTenantId: null,
        });
      },

      updateToken: (token: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              token,
            },
          });
        }
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            token: accessToken,
            refreshToken,
          };

          // Update in-memory state (Zustand persist will handle localStorage)
          set({ user: updatedUser });
        }
      },

      setAvailableTenants: (tenants) => {
        set({ availableTenants: tenants });
      },

      selectTenant: (tenantId: string, tenantName: string) => {
        const currentUser = get().user;

        if (!currentUser) {
          return;
        }

        // Update user with new tenant context
        set({
          user: {
            ...currentUser,
            tenantId,
            tenantName,
          },
          selectedTenantId: tenantId,
        });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),
      // Only persist essential user data (exclude large roles/permissions arrays)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        selectedTenantId: state.selectedTenantId,
        availableTenants: state.availableTenants,
        user: state.user
          ? {
              id: state.user.id,
              name: state.user.name,
              email: state.user.email,
              role: state.user.role,
              token: state.user.token,
              refreshToken: state.user.refreshToken,
              tenantId: state.user.tenantId,
              tenantName: state.user.tenantName,
              // Exclude roles and permissions (will be fetched fresh from /auth/me)
              roles: [],
              permissions: [],
            }
          : null,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, ensure isAuthenticated matches user state
        if (state && state.user && !state.isAuthenticated) {
          state.isAuthenticated = true;
        }
        if (state && !state.user && state.isAuthenticated) {
          state.isAuthenticated = false;
        }
      },
    },
  ),
);
