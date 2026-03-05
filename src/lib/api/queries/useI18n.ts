import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ProductTranslation } from "@/types/api.types";

/**
 * Query keys for Product Translations cache management
 */
export const productTranslationsQueryKeys = {
  all: ["product-translations"] as const,
  lists: () => [...productTranslationsQueryKeys.all, "list"] as const,
  list: (productId?: string) =>
    [...productTranslationsQueryKeys.lists(), { productId }] as const,
  details: () => [...productTranslationsQueryKeys.all, "detail"] as const,
  detail: (productId: string, locale: string) =>
    [...productTranslationsQueryKeys.details(), { productId, locale }] as const,
};

// ========== PRODUCT TRANSLATIONS ==========

export const useProductTranslations = (productId?: string) => {
  return useQuery({
    queryKey: productTranslationsQueryKeys.list(productId),
    queryFn: () =>
      apiClient.get<ProductTranslation[]>(
        `/i18n/products/${productId}/translations`,
      ),
    enabled: !!productId,
  });
};

export const useProductTranslation = (productId?: string, locale?: string) => {
  return useQuery({
    queryKey: productTranslationsQueryKeys.detail(
      productId || "",
      locale || "",
    ),
    queryFn: () =>
      apiClient.get<ProductTranslation>(
        `/i18n/products/${productId}/translations?locale=${locale}`,
      ),
    enabled: !!productId && !!locale,
  });
};
