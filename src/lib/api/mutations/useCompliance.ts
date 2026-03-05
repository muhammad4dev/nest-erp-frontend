import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  EInvoice,
  CreateEInvoiceDto,
  UpdateEInvoiceDto,
} from "@/types/api.types";

export function useCreateEInvoiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEInvoiceDto) =>
      apiClient.post<EInvoice>("/compliance/einvoices", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eInvoices"] });
    },
  });
}

export function useUpdateEInvoiceMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEInvoiceDto) =>
      apiClient.patch<EInvoice>(`/compliance/einvoices/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["eInvoices", id] });
    },
  });
}

export function useDeleteEInvoiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/compliance/einvoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eInvoices"] });
    },
  });
}

export function useSendEInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      apiClient.post<EInvoice>(`/compliance/einvoices/${id}/send`, {
        email,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eInvoices"] });
    },
  });
}
