import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  EInvoice,
  CreateEInvoiceDto,
  UpdateEInvoiceDto,
} from "@/types/api.types";

const EINVOICE_QUERY_KEY = ["eInvoices"] as const;

export function useEInvoices(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...EINVOICE_QUERY_KEY, { filters }],
    queryFn: async () => {
      return await apiClient.get<EInvoice[]>("/compliance/einvoices", {
        params: filters,
      });
    },
  });
}

export function useEInvoice(id: string) {
  return useQuery({
    queryKey: [...EINVOICE_QUERY_KEY, id],
    queryFn: async () => {
      return await apiClient.get<EInvoice>(`/compliance/einvoices/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateEInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEInvoiceDto) => {
      return await apiClient.post<EInvoice>("/compliance/einvoices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EINVOICE_QUERY_KEY });
    },
  });
}

export function useUpdateEInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateEInvoiceDto) => {
      return await apiClient.patch<EInvoice>(
        `/compliance/einvoices/${id}`,
        payload,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EINVOICE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EINVOICE_QUERY_KEY, id] });
    },
  });
}

export function useDeleteEInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/compliance/einvoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EINVOICE_QUERY_KEY });
    },
  });
}
