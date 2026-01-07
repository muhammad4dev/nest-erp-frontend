import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  PurchaseOrder,
  VendorBill,
  APAgingEntry,
} from "@/types/api.types";

/**
 * Query keys for procurement
 */
export const procurementQueryKeys = {
  all: ["procurement"] as const,
  purchaseOrders: (filters?: Record<string, unknown>) =>
    [...procurementQueryKeys.all, "purchaseOrders", { filters }] as const,
  purchaseOrder: (id: string) =>
    [...procurementQueryKeys.all, "purchaseOrders", "detail", id] as const,
  vendorBills: () => [...procurementQueryKeys.all, "vendorBills"] as const,
  vendorBill: (id: string) =>
    [...procurementQueryKeys.vendorBills(), id] as const,
  apAging: (filters?: { partnerId?: string; date?: string }) =>
    [...procurementQueryKeys.all, "apAging", filters] as const,
};

/**
 * Get all purchase orders (RFQs and Purchase Orders)
 */
export const usePurchaseOrders = (filters?: {
  status?: string;
  partnerId?: string;
}) => {
  return useQuery({
    queryKey: procurementQueryKeys.purchaseOrders(filters),
    queryFn: async () => {
      try {
        const response = await apiClient.get<PurchaseOrder[]>(
          "/procurement/orders",
          {
            params: filters,
          },
        );

        return response;
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        return [] as PurchaseOrder[];
      }
    },
  });
};

/**
 * Get a single purchase order by ID
 */
export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: procurementQueryKeys.purchaseOrder(id),
    queryFn: async () => {
      const response = await apiClient.get<PurchaseOrder>(
        `/procurement/orders/${id}`,
      );
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Get all vendor bills
 */
export const useVendorBills = () => {
  return useQuery({
    queryKey: procurementQueryKeys.vendorBills(),
    queryFn: async () => {
      const response = await apiClient.get<VendorBill[]>("/procurement/bills");
      return response;
    },
  });
};

/**
 * Get a single vendor bill by ID
 * GET /procurement/bills/:id
 */
export const useVendorBill = (id: string) => {
  return useQuery({
    queryKey: procurementQueryKeys.vendorBill(id),
    queryFn: async () => {
      const response = await apiClient.get<VendorBill>(
        `/procurement/bills/${id}`,
      );
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Get Accounts Payable Aging Report
 * GET /procurement/reports/ap-aging
 */
export const useAPAgingReport = (filters?: {
  partnerId?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: procurementQueryKeys.apAging(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.partnerId) {
        params.append("partnerId", filters.partnerId);
      }
      if (filters?.date) {
        params.append("date", filters.date);
      }
      const queryString = params.toString();
      const url = queryString
        ? `/procurement/reports/ap-aging?${queryString}`
        : "/procurement/reports/ap-aging";
      const response = await apiClient.get<APAgingEntry[]>(url);
      return response;
    },
  });
};
