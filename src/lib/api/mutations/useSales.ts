import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { salesQueryKeys } from "@/lib/api/queries/useSales";
import type {
  CreateSalesOrderDto,
  Invoice,
  SalesOrder,
  UpdateSalesOrderDto,
} from "@/types/api.types";

// ========== SALES ORDERS ==========

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSalesOrderDto) =>
      apiClient.post<SalesOrder>("/sales/orders", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
    },
  });
};

export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSalesOrderDto }) =>
      apiClient.put<SalesOrder>(`/sales/orders/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useSendQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SalesOrder>(`/sales/orders/${id}/send-quote`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useConfirmSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SalesOrder>(`/sales/orders/${id}/confirm`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useCancelSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SalesOrder>(`/sales/orders/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

// ========== INVOICES ==========

export const useCreateInvoiceFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post<Invoice>(`/sales/orders/${orderId}/invoice`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.invoices.all(),
      });
    },
  });
};

export const usePostInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<Invoice>(`/sales/invoices/${id}/post`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.invoices.all(),
      });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.invoices.detail(id),
      });
    },
  });
};
