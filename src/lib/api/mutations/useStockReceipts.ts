import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  StockReceipt,
  StockIssue,
  CreateStockReceiptDto,
  UpdateStockReceiptDto,
  CreateStockIssueDto,
  UpdateStockIssueDto,
} from "@/types/api.types";

import { productsQueryKeys } from "../queries/useProducts";
import {
  receiptsQueryKeys,
  issuesQueryKeys,
} from "../queries/useStockReceipts";

/**
 * Create a new stock receipt
 * POST /inventory/receipts
 */
export const useCreateStockReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStockReceiptDto) => {
      const response = await apiClient.post<StockReceipt>(
        "/inventory/receipts",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptsQueryKeys.lists() });
    },
  });
};

/**
 * Update a stock receipt
 * PUT /inventory/receipts/:id
 */
export const useUpdateStockReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockReceiptDto;
    }) => {
      const response = await apiClient.put<StockReceipt>(
        `/inventory/receipts/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: receiptsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: receiptsQueryKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Complete a stock receipt (updates stock)
 * POST /inventory/receipts/:id/complete
 */
export const useCompleteStockReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<StockReceipt>(
        `/inventory/receipts/${id}/complete`,
      );
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: receiptsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: receiptsQueryKeys.detail(id),
      });
      // Invalidate stock queries since stock was updated
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.stock.all });
    },
  });
};

/**
 * Delete a stock receipt
 * POST /inventory/receipts/:id/delete
 */
export const useDeleteStockReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/inventory/receipts/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptsQueryKeys.lists() });
    },
  });
};

/**
 * Create a new stock issue
 * POST /inventory/issues
 */
export const useCreateStockIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStockIssueDto) => {
      const response = await apiClient.post<StockIssue>(
        "/inventory/issues",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKeys.lists() });
    },
  });
};

/**
 * Update a stock issue
 * PUT /inventory/issues/:id
 */
export const useUpdateStockIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockIssueDto;
    }) => {
      const response = await apiClient.put<StockIssue>(
        `/inventory/issues/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: issuesQueryKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Complete a stock issue (deducts stock)
 * POST /inventory/issues/:id/complete
 */
export const useCompleteStockIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<StockIssue>(
        `/inventory/issues/${id}/complete`,
      );
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: issuesQueryKeys.detail(id),
      });
      // Invalidate stock queries since stock was updated
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.stock.all });
    },
  });
};

/**
 * Delete a stock issue
 * POST /inventory/issues/:id/delete
 */
export const useDeleteStockIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/inventory/issues/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issuesQueryKeys.lists() });
    },
  });
};
