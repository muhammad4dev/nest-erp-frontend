import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { StockTransfer } from "@/types/api.types";

/**
 * Query keys for Stock Transfers cache management
 */
export const stockTransfersQueryKeys = {
  all: ["stock-transfers"] as const,
  lists: () => [...stockTransfersQueryKeys.all, "list"] as const,
  list: (filters?: any) =>
    [...stockTransfersQueryKeys.lists(), { filters }] as const,
  details: () => [...stockTransfersQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...stockTransfersQueryKeys.details(), id] as const,
};

// ========== STOCK TRANSFERS ==========

export const useStockTransfers = (filters?: {
  status?: string;
  locationId?: string;
}) => {
  return useQuery({
    queryKey: stockTransfersQueryKeys.list(filters),
    queryFn: () =>
      apiClient.get<StockTransfer[]>("/inventory/stock/transfers", {
        params: filters,
      }),
  });
};

export const useStockTransfer = (id?: string) => {
  return useQuery({
    queryKey: stockTransfersQueryKeys.detail(id || ""),
    queryFn: () => apiClient.get<StockTransfer>(`/inventory/stock/transfers/${id}`),
    enabled: !!id,
  });
};
