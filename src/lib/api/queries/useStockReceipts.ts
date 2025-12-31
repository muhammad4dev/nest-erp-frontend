import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { StockReceipt, StockIssue } from "@/types/api.types";

/**
 * Query keys for stock receipts and issues
 */
export const receiptsQueryKeys = {
  all: ["stock-receipts"] as const,
  lists: () => [...receiptsQueryKeys.all, "list"] as const,
  list: (filters?: {
    status?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) => [...receiptsQueryKeys.lists(), { filters }] as const,
  details: () => [...receiptsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...receiptsQueryKeys.details(), id] as const,
};

export const issuesQueryKeys = {
  all: ["stock-issues"] as const,
  lists: () => [...issuesQueryKeys.all, "list"] as const,
  list: (filters?: {
    status?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) => [...issuesQueryKeys.lists(), { filters }] as const,
  details: () => [...issuesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...issuesQueryKeys.details(), id] as const,
};

/**
 * Fetch all stock receipts
 * GET /inventory/receipts
 */
export const useStockReceipts = (filters?: {
  status?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: receiptsQueryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.locationId) params.append("locationId", filters.locationId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const queryString = params.toString();
      const url = `/inventory/receipts${queryString ? `?${queryString}` : ""}`;
      const response = await apiClient.get<StockReceipt[]>(url);
      return response;
    },
  });
};

/**
 * Fetch single stock receipt by ID
 * GET /inventory/receipts/:id
 */
export const useStockReceipt = (id?: string) => {
  return useQuery({
    queryKey: receiptsQueryKeys.detail(id || ""),
    queryFn: async () => {
      const response = await apiClient.get<StockReceipt>(
        `/inventory/receipts/${id}`
      );
      return response;
    },
    enabled: Boolean(id),
  });
};

/**
 * Fetch all stock issues
 * GET /inventory/issues
 */
export const useStockIssues = (filters?: {
  status?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: issuesQueryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.locationId) params.append("locationId", filters.locationId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const queryString = params.toString();
      const url = `/inventory/issues${queryString ? `?${queryString}` : ""}`;
      const response = await apiClient.get<StockIssue[]>(url);
      return response;
    },
  });
};

/**
 * Fetch single stock issue by ID
 * GET /inventory/issues/:id
 */
export const useStockIssue = (id?: string) => {
  return useQuery({
    queryKey: issuesQueryKeys.detail(id || ""),
    queryFn: async () => {
      const response = await apiClient.get<StockIssue>(
        `/inventory/issues/${id}`
      );
      return response;
    },
    enabled: Boolean(id),
  });
};
