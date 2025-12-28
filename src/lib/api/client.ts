import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { APP_CONFIG } from "@/config/constants";
import { getStoredUser, updateStoredTokens } from "@/lib/auth/tokenStorage";
import { useAuthStore } from "@/stores/authStore";

// Create API client with response interceptor that unwraps data
const client = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag and queue to ensure only one token refresh happens at a time
let isRefreshing = false;
let currentRefreshToken: string | null = null; // Track the refresh token being used
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

// Track the freshly refreshed access token at module level
// This ensures the request interceptor uses the latest token immediately after refresh,
// bypassing the potentially stale Zustand state (which hydrates asynchronously)
let freshAccessToken: string | null = null;

const processQueue = (token: string | null, error?: Error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const refreshToken = async (): Promise<string> => {
  try {
    const { user, login } = useAuthStore.getState();

    // Try store first, fallback to localStorage via tokenStorage utility
    let authUser = user;
    if (!authUser?.refreshToken) {
      const storedUser = getStoredUser();
      if (storedUser) {
        authUser = storedUser;
        // Rehydrate in-memory store
        login(storedUser);
      }
    }

    if (!authUser?.refreshToken) {
      throw new Error("No refresh token available");
    }

    // Prevent re-using an old refresh token if we already tried with it
    if (currentRefreshToken === authUser.refreshToken && isRefreshing) {
      throw new Error("Duplicate refresh attempt with same token");
    }

    currentRefreshToken = authUser.refreshToken;

    const response = await axios.post<{
      access_token: string;
      refresh_token: string;
    }>(
      `${APP_CONFIG.apiBaseUrl}/auth/refresh`,
      { refreshToken: authUser.refreshToken },
      {
        withCredentials: true,
        headers: {
          "x-tenant-id": authUser.tenantId,
        },
      }
    );

    const { access_token: newAccessToken, refresh_token: newRefreshToken } =
      response.data;

    currentRefreshToken = newRefreshToken;

    // CRITICAL: Store fresh token at module level for immediate use
    freshAccessToken = newAccessToken;

    // Persist to localStorage via centralized utility (single source of truth)
    updateStoredTokens(newAccessToken, newRefreshToken);

    // Update in-memory Zustand state
    const updatedUser = {
      ...authUser,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
    const { login: loginFn } = useAuthStore.getState();
    loginFn(updatedUser);

    return newAccessToken;
  } catch (error) {
    const err = error as AxiosError;
    const { logout } = useAuthStore.getState();
    logout();
    throw err;
  }
};

// Request interceptor to add auth token and tenant-id header
client.interceptors.request.use(
  (config) => {
    const isRetry = (
      config as InternalAxiosRequestConfig & { _retry?: boolean }
    )._retry;
    if (isRetry) {
      return config;
    }

    const { user } = useAuthStore.getState();

    if (user) {
      // PRIORITY: Use freshAccessToken if available (set immediately after refresh)
      // This bypasses Zustand's async hydration timing issues where the store
      // might still have stale tokens from localStorage
      const tokenToUse = freshAccessToken ?? user.token;

      // Add JWT token
      config.headers.Authorization = `Bearer ${tokenToUse}`;

      // CRITICAL: Add tenant-id header for multi-tenant isolation
      if (user.tenantId) {
        config.headers["x-tenant-id"] = user.tenantId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
client.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - attempt token refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = await refreshToken();
        processQueue(token);

        // Set the new token in the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Use axios directly to bypass all interceptors for the retry
        return axios(originalRequest);
      } catch (refreshError) {
        const err = refreshError as AxiosError;
        processQueue(null, err as Error);
        const { logout } = useAuthStore.getState();
        logout();

        // Clear fresh token on logout
        freshAccessToken = null;

        // Don't cause full page reload - let the app handle routing
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          // Store the intended destination
          sessionStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname
          );
          // Use router navigation instead of window.location to avoid reload
          window.history.pushState({}, "", "/en/login");
          // Dispatch a popstate event to trigger router navigation
          window.dispatchEvent(new PopStateEvent("popstate"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      // Silently handle - user lacks permissions for this resource
    }

    return Promise.reject(error);
  }
);

// Type-safe API client wrapper
export const apiClient = {
  get: <T>(
    url: string,
    config?: Parameters<typeof client.get>[1]
  ): Promise<T> => client.get(url, config),
  post: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof client.post>[2]
  ): Promise<T> => client.post(url, data, config),
  put: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof client.put>[2]
  ): Promise<T> => client.put(url, data, config),
  patch: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof client.patch>[2]
  ): Promise<T> => client.patch(url, data, config),
  delete: <T = void>(
    url: string,
    config?: Parameters<typeof client.delete>[1]
  ): Promise<T> => client.delete(url, config),
};
