import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { stockTransfersQueryKeys } from "@/lib/api/queries/useStockTransfers";
import type { StockTransfer } from "@/types/api.types";

export interface CreateStockTransferDto {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reference?: string;
}

// ========== STOCK TRANSFERS ==========

export const useCreateStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateStockTransferDto) =>
      apiClient.post<StockTransfer>("/inventory/stock/transfer", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: stockTransfersQueryKeys.all,
      });
    },
  });
};

export const useCompleteStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<StockTransfer>(
        `/inventory/stock/transfers/${id}/complete`,
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: stockTransfersQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: stockTransfersQueryKeys.detail(id),
      });
    },
  });
};

export const useCancelStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<StockTransfer>(`/inventory/stock/transfers/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: stockTransfersQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: stockTransfersQueryKeys.detail(id),
      });
    },
  });
};
