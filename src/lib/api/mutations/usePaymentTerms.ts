import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { paymentTermsQueryKeys } from "@/lib/api/queries/usePaymentTerms";
import type { PaymentTerm } from "@/types/api.types";

export interface CreatePaymentTermDto {
  name: string;
  description?: string;
  daysToPayment: number;
}

export interface UpdatePaymentTermDto {
  name?: string;
  description?: string;
  daysToPayment?: number;
}

// ========== PAYMENT TERMS ==========

export const useCreatePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePaymentTermDto) =>
      apiClient.post<PaymentTerm>("/finance/payment-terms", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentTermsQueryKeys.all,
      });
    },
  });
};

export const useUpdatePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePaymentTermDto }) =>
      apiClient.put<PaymentTerm>(`/finance/payment-terms/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: paymentTermsQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: paymentTermsQueryKeys.detail(id),
      });
    },
  });
};

export const useDeletePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(`/finance/payment-terms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentTermsQueryKeys.all,
      });
    },
  });
};
