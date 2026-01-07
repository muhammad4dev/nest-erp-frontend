import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  ProductAttribute,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  ProductVariant,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  GenerateVariantsDto,
  StockTransferDto,
  StockAdjustmentDto,
  StockLocation,
} from "@/types/api.types";

import { productsQueryKeys } from "../queries/useProducts";

/**
 * Create a new product
 * POST /inventory/products
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const response = await apiClient.post<Product>(
        "/inventory/products",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
    },
  });
};

/**
 * Update a product
 * PUT /inventory/products/:id
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductDto;
    }) => {
      const response = await apiClient.put<Product>(
        `/inventory/products/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Create a product category
 * POST /products/categories
 */
export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductCategoryDto) => {
      const response = await apiClient.post<ProductCategory>(
        "/products/categories",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.all,
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.tree(),
      });
    },
  });
};

/**
 * Update a product category
 * PUT /products/categories/:id
 */
export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductCategoryDto;
    }) => {
      const response = await apiClient.put<ProductCategory>(
        `/products/categories/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.all,
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.tree(),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.detail(variables.id),
      });
    },
  });
};

/**
 * Delete (deactivate) a product category
 * DELETE /products/categories/:id
 */
export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.all,
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.categories.tree(),
      });
    },
  });
};

/**
 * Create a product attribute
 * POST /products/attributes
 */
export const useCreateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductAttributeDto) => {
      const response = await apiClient.post<ProductAttribute>(
        "/products/attributes",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.attributes.all,
      });
    },
  });
};

/**
 * Update a product attribute
 * PUT /products/attributes/:id
 */
export const useUpdateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductAttributeDto;
    }) => {
      const response = await apiClient.put<ProductAttribute>(
        `/products/attributes/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.attributes.all,
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.attributes.detail(variables.id),
      });
    },
  });
};

/**
 * Delete a product attribute
 * DELETE /products/attributes/:id
 */
export const useDeleteProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/attributes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.attributes.all,
      });
    },
  });
};

/**
 * Create a product variant
 * POST /products/:productId/variants
 */
export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateProductVariantDto;
    }) => {
      const response = await apiClient.post<ProductVariant>(
        `/products/${productId}/variants`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.variants.all(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.productId),
      });
    },
  });
};

/**
 * Update a product variant
 * PUT /products/:productId/variants/:variantId
 */
export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: UpdateProductVariantDto;
    }) => {
      const response = await apiClient.put<ProductVariant>(
        `/products/${productId}/variants/${variantId}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.variants.all(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.variants.detail(
          variables.productId,
          variables.variantId,
        ),
      });
    },
  });
};

/**
 * Delete (deactivate) a product variant
 * DELETE /products/:productId/variants/:variantId
 */
export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => {
      await apiClient.delete(`/products/${productId}/variants/${variantId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.variants.all(variables.productId),
      });
    },
  });
};

/**
 * Generate variants automatically from attribute combinations
 * POST /products/:productId/variants/generate
 */
export const useGenerateVariants = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: GenerateVariantsDto;
    }) => {
      const response = await apiClient.post<ProductVariant[]>(
        `/products/${productId}/variants/generate`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.variants.all(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.productId),
      });
    },
  });
};

/**
 * Transfer stock between locations
 * POST /inventory/stock/transfer
 */
export const useStockTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StockTransferDto) => {
      await apiClient.post("/inventory/stock/transfer", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.byLocation(variables.fromLocationId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.byLocation(variables.toLocationId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.ledger(),
      });
    },
  });
};

/**
 * Adjust stock quantity
 * POST /inventory/stock/adjust
 */
export const useStockAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StockAdjustmentDto) => {
      await apiClient.post("/inventory/stock/adjust", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.byLocation(variables.locationId),
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.stock.ledger(),
      });
    },
  });
};

/**
 * Create a stock location
 * POST /inventory/locations
 */
export const useCreateStockLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      locationType: string;
      parentId?: string;
    }) => {
      const response = await apiClient.post<StockLocation>(
        "/inventory/locations",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.locations.all,
      });
    },
  });
};

/**
 * Update a stock location
 * PUT /inventory/locations/:id
 */
export const useUpdateStockLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        code?: string;
        locationType?: string;
        parentId?: string;
        isActive?: boolean;
      };
    }) => {
      const response = await apiClient.put<StockLocation>(
        `/inventory/locations/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.locations.all,
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.locations.detail(variables.id),
      });
    },
  });
};
