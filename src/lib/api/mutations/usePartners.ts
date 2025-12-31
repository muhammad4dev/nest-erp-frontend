import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { partnersQueryKeys } from "@/lib/api/queries/usePartners";
import type {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
} from "@/types/api.types";

/**
 * Create a new partner
 * POST /partners
 */
export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePartnerDto) => {
      const response = await apiClient.post<Partner>("/partners", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersQueryKeys.lists() });
    },
  });
};

/**
 * Update a partner
 * PUT /partners/:id
 */
export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePartnerDto;
    }) => {
      const response = await apiClient.put<Partner>(`/partners/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnersQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: partnersQueryKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Delete a partner
 * DELETE /partners/:id
 */
export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersQueryKeys.lists() });
    },
  });
};
