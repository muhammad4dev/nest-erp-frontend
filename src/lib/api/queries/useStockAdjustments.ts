import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { StockAdjustment } from "@/types/api.types";

/**
 * Query keys for Stock Adjustments cache management
 */
export const stockAdjustmentsQueryKeys = {
  all: ["stock-adjustments"] as const,
  lists: () => [...stockAdjustmentsQueryKeys.all, "list"] as const,
  list: (filters?: any) =>
    [...stockAdjustmentsQueryKeys.lists(), { filters }] as const,
  details: () => [...stockAdjustmentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...stockAdjustmentsQueryKeys.details(), id] as const,
};

// ========== STOCK ADJUSTMENTS ==========

export const useStockAdjustments = (filters?: {
  status?: string;
  locationId?: string;
}) => {
  return useQuery({
    queryKey: stockAdjustmentsQueryKeys.list(filters),
    queryFn: () =>
      apiClient.get<StockAdjustment[]>("/inventory/stock/adjustments", {
        params: filters,
      }),
  });
};

export const useStockAdjustment = (id?: string) => {
  return useQuery({
    queryKey: stockAdjustmentsQueryKeys.detail(id || ""),
    queryFn: () =>
      apiClient.get<StockAdjustment>(`/inventory/stock/adjustments/${id}`),
    enabled: !!id,
  });
};
