import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { NotificationHistoryItem } from "../queries/useNotifications";
import { queryKeys } from "../query-keys";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/notifications`;

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.put(`${API_URL}/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<NotificationHistoryItem[]>(
        queryKeys.notifications.all,
        (oldData) =>
          oldData?.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
      );
    },
  });
};

export const useClearNotificationHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.delete(API_URL);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.notifications.all, []);
    },
  });
};
