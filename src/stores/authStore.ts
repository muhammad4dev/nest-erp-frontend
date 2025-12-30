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

      setAvailableTenants: (tenants) => {
        set({ availableTenants: tenants });
      },

      selectTenant: (tenantId: string, tenantName: string) => {
        const currentUser = get().user;

        if (!currentUser) {
          console.error("Cannot select tenant: user not authenticated");
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
    },
  ),
);
