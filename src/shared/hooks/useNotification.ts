import { useTranslation } from "react-i18next";

import { useNotificationStore } from "@/stores/notificationStore";

/**
 * Hook to display toast notifications
 */
export function useNotification() {
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  }

  interface NotificationActions {
    showNotification: (
      message: string,
      type?: "success" | "error" | "info" | "warning",
    ) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
    apiError: (error: ApiError, fallbackMessage: string) => void;
  }

  const actions: NotificationActions = {
    showNotification: (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
    ) => {
      addNotification({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type,
      });
    },

    // Convenience methods (optional)
    success: (message: string) => {
      addNotification({
        title: t("common.success", "Success"),
        message,
        type: "success",
      });
    },

    error: (message: string) => {
      addNotification({
        title: t("common.error", "Error"),
        message,
        type: "error",
      });
    },

    info: (message: string) => {
      addNotification({
        title: t("common.info", "Info"),
        message,
        type: "info",
      });
    },

    warning: (message: string) => {
      addNotification({
        title: t("common.warning", "Warning"),
        message,
        type: "warning",
      });
    },

    // API error helper
    apiError: (error: ApiError, fallbackMessage: string) => {
      const message =
        error?.response?.data?.message || error?.message || fallbackMessage;
      addNotification({
        title: t("common.error", "Error"),
        message,
        type: "error",
        duration: 7000, // Longer for errors
      });
    },
  };

  return actions;
}
