import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { productTranslationsQueryKeys } from "@/lib/api/queries/useI18n";
import type { ProductTranslation } from "@/types/api.types";

export interface CreateProductTranslationDto {
  productId: string;
  locale: string;
  name: string;
}

// ========== PRODUCT TRANSLATIONS ==========

export const useAddProductTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductTranslationDto) =>
      apiClient.post<ProductTranslation>("/i18n/products/translations", dto),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productTranslationsQueryKeys.list(productId),
      });
    },
  });
};
