import { QueryCache, QueryClient } from "@tanstack/react-query";

import { useNotificationStore } from "@/stores/notificationStore";

export const queryClient = new QueryClient({
  // Global error handling for queries via QueryCache
  queryCache: new QueryCache({
    onError: (error: Error) => {
      // Auto-show notification for all query errors
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error?.message ||
        "Failed to fetch data";
      useNotificationStore.getState().addNotification({
        title: "Error",
        message,
        type: "error",
      });
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: Error) => {
        // Auto-show notification for all mutation errors
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          error?.message ||
          "An error occurred";
        useNotificationStore.getState().addNotification({
          title: "Error",
          message,
          type: "error",
        });
      },
      retry: 0,
    },
  },
});
