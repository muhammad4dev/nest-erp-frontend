/**
 * Centralized token storage utility.
 * Handles tokens outside of Zustand to avoid async hydration issues.
 * This is the SINGLE SOURCE OF TRUTH for tokens.
 */

import { STORAGE_KEYS } from "@/config/constants";
import type { AuthUser } from "@/lib/rbac/types";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

interface PersistedAuthState {
  state: {
    isAuthenticated: boolean;
    selectedTenantId: string | null;
    availableTenants: unknown[];
    user: AuthUser | null;
  };
  version: number;
}

/**
 * Get tokens from localStorage.
 * This reads from the Zustand persist format.
 */
export function getStoredTokens(): StoredTokens | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PersistedAuthState;
    const user = parsed?.state?.user;

    if (user?.token && user?.refreshToken) {
      return {
        accessToken: user.token,
        refreshToken: user.refreshToken,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get full user data from localStorage.
 */
export function getStoredUser(): PersistedAuthState["state"]["user"] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PersistedAuthState;
    return parsed?.state?.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Update tokens in localStorage.
 * Preserves the existing user data and only updates tokens.
 */
export function updateStoredTokens(
  accessToken: string,
  refreshToken: string
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!stored) return;

    const parsed = JSON.parse(stored) as PersistedAuthState;
    if (!parsed?.state?.user) return;

    // Update only the tokens, preserve everything else
    parsed.state.user.token = accessToken;
    parsed.state.user.refreshToken = refreshToken;

    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(parsed));
  } catch {
    // Silent fail - will be handled by auth flow
  }
}

/**
 * Clear all auth data from localStorage.
 */
export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}
