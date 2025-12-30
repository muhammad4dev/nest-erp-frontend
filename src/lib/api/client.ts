import axios, { type AxiosError } from "axios";

import { APP_CONFIG } from "@/config/constants";
import { useAuthStore } from "@/stores/authStore";

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and tenant-id header
apiClient.interceptors.request.use(
  (config) => {
    const { user } = useAuthStore.getState();

    if (user) {
      // Add JWT token
      config.headers.Authorization = `Bearer ${user.token}`;

      // CRITICAL: Add tenant-id header for multi-tenant isolation
      if (user.tenantId) {
        config.headers["x-tenant-id"] = user.tenantId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as unknown as { _retry?: boolean };

    // Handle 401 Unauthorized - token expired or invalid
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const { logout } = useAuthStore.getState();

      // For now, logout user on 401 (TODO: implement token refresh)
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/en/login";
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error("Access denied:", error.response.data);
    }

    return Promise.reject(error);
  },
);
