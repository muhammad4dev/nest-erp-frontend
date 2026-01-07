import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { procurementQueryKeys } from "@/lib/api/queries/useProcurement";
import type {
  CreateRfqDto,
  PurchaseOrder,
  VendorBill,
} from "@/types/api.types";

/**
 * Create a new Request for Quotation (RFQ)
 * POST /procurement/rfq
 */
export const useCreateRfq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRfqDto) => {
      const response = await apiClient.post<PurchaseOrder>(
        "/procurement/rfq",
        data,
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate purchase orders list to refetch
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.purchaseOrders(),
      });
    },
  });
};

/**
 * Confirm an RFQ into a Purchase Order
 * POST /procurement/orders/:id/confirm
 */
export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post<PurchaseOrder>(
        `/procurement/orders/${orderId}/confirm`,
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate both the specific order and the list
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.purchaseOrder(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.purchaseOrders(),
      });
    },
  });
};

/**
 * Create a vendor bill from a purchase order
 * POST /procurement/orders/:id/bill
 */
export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post<VendorBill>(
        `/procurement/orders/${orderId}/bill`,
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate vendor bills list and the purchase order
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.vendorBills(),
      });
      if (data.purchaseOrderId) {
        queryClient.invalidateQueries({
          queryKey: procurementQueryKeys.purchaseOrder(data.purchaseOrderId),
        });
        queryClient.invalidateQueries({
          queryKey: procurementQueryKeys.purchaseOrders(),
        });
      }
    },
  });
};

/**
 * Post (finalize) a vendor bill
 * POST /procurement/bills/:id/post
 */
export const usePostBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const response = await apiClient.post<VendorBill>(
        `/procurement/bills/${billId}/post`,
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate both the specific bill and the list
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.vendorBill(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.vendorBills(),
      });
      // Also invalidate AP aging as it may have changed
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.apAging(),
      });
    },
  });
};
