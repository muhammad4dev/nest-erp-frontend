import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  ARAgingEntry,
  ARAgingQueryDto,
  Invoice,
  InvoiceStatus,
  SalesAnalysisEntry,
  SalesAnalysisQueryDto,
  SalesOrder,
  SalesOrderStatus,
} from "@/types/api.types";

/**
 * Query keys for React Query cache management
 */
export const salesQueryKeys = {
  all: ["sales"] as const,
  orders: {
    all: () => [...salesQueryKeys.all, "orders"] as const,
    lists: () => [...salesQueryKeys.orders.all(), "list"] as const,
    list: (status?: SalesOrderStatus) =>
      [...salesQueryKeys.orders.lists(), { status }] as const,
    details: () => [...salesQueryKeys.orders.all(), "detail"] as const,
    detail: (id: string) => [...salesQueryKeys.orders.details(), id] as const,
  },
  invoices: {
    all: () => [...salesQueryKeys.all, "invoices"] as const,
    lists: () => [...salesQueryKeys.invoices.all(), "list"] as const,
    list: (status?: InvoiceStatus) =>
      [...salesQueryKeys.invoices.lists(), { status }] as const,
    details: () => [...salesQueryKeys.invoices.all(), "detail"] as const,
    detail: (id: string) => [...salesQueryKeys.invoices.details(), id] as const,
  },
  reports: {
    all: () => [...salesQueryKeys.all, "reports"] as const,
    analysis: (query?: SalesAnalysisQueryDto) =>
      [...salesQueryKeys.reports.all(), "analysis", query] as const,
    arAging: (query?: ARAgingQueryDto) =>
      [...salesQueryKeys.reports.all(), "ar-aging", query] as const,
  },
};

// ========== SALES ORDERS ==========

export const useListSalesOrders = (status?: SalesOrderStatus) => {
  return useQuery({
    queryKey: salesQueryKeys.orders.list(status),
    queryFn: () =>
      apiClient.get<SalesOrder[]>("/sales/orders", {
        params: { status },
      }),
  });
};

export const useGetSalesOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: salesQueryKeys.orders.detail(id),
    queryFn: () => apiClient.get<SalesOrder>(`/sales/orders/${id}`),
    enabled: enabled && !!id,
  });
};

// ========== INVOICES ==========

export const useListInvoices = (status?: InvoiceStatus) => {
  return useQuery({
    queryKey: salesQueryKeys.invoices.list(status),
    queryFn: () =>
      apiClient.get<Invoice[]>("/sales/invoices", {
        params: { status },
      }),
  });
};

export const useGetInvoice = (id: string, enabled = true) => {
  return useQuery({
    queryKey: salesQueryKeys.invoices.detail(id),
    queryFn: () => apiClient.get<Invoice>(`/sales/invoices/${id}`),
    enabled: enabled && !!id,
  });
};

// ========== REPORTS ==========

export const useSalesAnalysis = (query?: SalesAnalysisQueryDto) => {
  return useQuery({
    queryKey: salesQueryKeys.reports.analysis(query),
    queryFn: () =>
      apiClient.get<SalesAnalysisEntry[]>("/sales/reports/analysis", {
        params: query,
      }),
  });
};

export const useARAgingReport = (query?: ARAgingQueryDto) => {
  return useQuery({
    queryKey: salesQueryKeys.reports.arAging(query),
    queryFn: () =>
      apiClient.get<ARAgingEntry[]>("/sales/reports/ar-aging", {
        params: query,
      }),
  });
};
