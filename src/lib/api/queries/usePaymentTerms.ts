import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { PaymentTerm } from "@/types/api.types";

/**
 * Query keys for Payment Terms cache management
 */
export const paymentTermsQueryKeys = {
  all: ["payment-terms"] as const,
  lists: () => [...paymentTermsQueryKeys.all, "list"] as const,
  list: () => [...paymentTermsQueryKeys.lists()] as const,
  details: () => [...paymentTermsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentTermsQueryKeys.details(), id] as const,
};

// ========== PAYMENT TERMS ==========

export const usePaymentTerms = () => {
  return useQuery({
    queryKey: paymentTermsQueryKeys.list(),
    queryFn: () =>
      apiClient.get<PaymentTerm[]>("/finance/config/payment-terms"),
  });
};

export const usePaymentTerm = (id?: string) => {
  return useQuery({
    queryKey: paymentTermsQueryKeys.detail(id || ""),
    queryFn: () => apiClient.get<PaymentTerm>(`/finance/payment-terms/${id}`),
    enabled: !!id,
  });
};
