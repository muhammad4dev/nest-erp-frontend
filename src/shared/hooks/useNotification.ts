import { useNotificationStore } from "@/stores/notificationStore";

/**
 * Hook to display toast notifications
 */
export function useNotification() {
  const { addNotification } = useNotificationStore();

  return {
    showNotification: (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info"
    ) => {
      addNotification({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type,
      });
    },
  };
}
