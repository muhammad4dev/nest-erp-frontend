import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { stockAdjustmentsQueryKeys } from "@/lib/api/queries/useStockAdjustments";
import type { StockAdjustment } from "@/types/api.types";

export interface CreateStockAdjustmentDto {
  productId: string;
  locationId: string;
  quantity: number;
  reason: string;
}

// ========== STOCK ADJUSTMENTS ==========

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateStockAdjustmentDto) =>
      apiClient.post<StockAdjustment>("/inventory/stock/adjust", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: stockAdjustmentsQueryKeys.all,
      });
    },
  });
};

export const useCancelStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<StockAdjustment>(
        `/inventory/stock/adjustments/${id}/cancel`
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: stockAdjustmentsQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: stockAdjustmentsQueryKeys.detail(id),
      });
    },
  });
};
