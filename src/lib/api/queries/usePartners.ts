import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { Partner } from "@/types/api.types";

/**
 * Query keys for partners
 */
export const partnersQueryKeys = {
  all: ["partners"] as const,
  lists: () => [...partnersQueryKeys.all, "list"] as const,
  list: (filters?: { isCustomer?: boolean; isVendor?: boolean }) =>
    [...partnersQueryKeys.lists(), filters] as const,
  details: () => [...partnersQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...partnersQueryKeys.details(), id] as const,
};

/**
 * Get all partners with optional filters
 * GET /partners?isCustomer=true&isVendor=false
 */
export const usePartners = (filters?: {
  isCustomer?: boolean;
  isVendor?: boolean;
}) => {
  return useQuery({
    queryKey: partnersQueryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.isCustomer !== undefined) {
        params.append("isCustomer", String(filters.isCustomer));
      }
      if (filters?.isVendor !== undefined) {
        params.append("isVendor", String(filters.isVendor));
      }
      const queryString = params.toString();
      const url = queryString ? `/partners?${queryString}` : "/partners";
      const response = await apiClient.get<Partner[]>(url);
      return response;
    },
  });
};

/**
 * Get a single partner by ID
 * GET /partners/:id
 */
export const usePartner = (id: string) => {
  return useQuery({
    queryKey: partnersQueryKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Partner>(`/partners/${id}`);
      return response;
    },
    enabled: !!id,
  });
};
