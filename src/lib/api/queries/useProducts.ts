import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  Product,
  ProductCategory,
  ProductAttribute,
  ProductVariant,
  StockLocation,
  StockQuant,
  StockLedgerEntry,
  StockLedgerQueryDto,
  StockValuationQueryDto,
} from "@/types/api.types";

/**
 * Query keys for React Query cache management
 */
export const productsQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productsQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...productsQueryKeys.lists(), { filters }] as const,
  details: () => [...productsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...productsQueryKeys.details(), id] as const,
  categories: {
    all: ["product-categories"] as const,
    tree: () => [...productsQueryKeys.categories.all, "tree"] as const,
    detail: (id: string) => [...productsQueryKeys.categories.all, id] as const,
  },
  attributes: {
    all: ["product-attributes"] as const,
    filterable: () =>
      [...productsQueryKeys.attributes.all, "filterable"] as const,
    variant: () => [...productsQueryKeys.attributes.all, "variant"] as const,
    detail: (id: string) => [...productsQueryKeys.attributes.all, id] as const,
  },
  variants: {
    all: (productId: string) => ["product-variants", productId] as const,
    detail: (productId: string, variantId: string) =>
      ["product-variants", productId, variantId] as const,
  },
  stock: {
    all: ["stock"] as const,
    byProduct: (productId: string) =>
      [...productsQueryKeys.stock.all, "product", productId] as const,
    byLocation: (locationId: string) =>
      [...productsQueryKeys.stock.all, "location", locationId] as const,
    ledger: (filters?: StockLedgerQueryDto) =>
      [...productsQueryKeys.stock.all, "ledger", filters] as const,
    valuation: (filters?: StockValuationQueryDto) =>
      [...productsQueryKeys.stock.all, "valuation", filters] as const,
  },
  locations: {
    all: ["stock-locations"] as const,
    detail: (id: string) => [...productsQueryKeys.locations.all, id] as const,
  },
};

/**
 * Fetch all products
 * GET /inventory/products
 */
export const useProducts = () => {
  return useQuery({
    queryKey: productsQueryKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<Product[]>("/inventory/products");
      return response;
    },
  });
};

/**
 * Fetch single product by ID
 * GET /inventory/products/:id
 */
export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.detail(id || ""),
    queryFn: async () => {
      const response = await apiClient.get<Product>(
        `/inventory/products/${id}`
      );
      return response;
    },
    enabled: Boolean(id),
  });
};

/**
 * Fetch all product categories
 * GET /products/categories
 */
export const useProductCategories = () => {
  return useQuery({
    queryKey: productsQueryKeys.categories.all,
    queryFn: async () => {
      const response = await apiClient.get<ProductCategory[]>(
        "/products/categories"
      );
      return response;
    },
  });
};

/**
 * Fetch category tree (hierarchical structure)
 * GET /products/categories/tree
 */
export const useCategoryTree = () => {
  return useQuery({
    queryKey: productsQueryKeys.categories.tree(),
    queryFn: async () => {
      const response = await apiClient.get<ProductCategory[]>(
        "/products/categories/tree"
      );
      return response;
    },
  });
};

/**
 * Fetch single category by ID
 * GET /products/categories/:id
 */
export const useProductCategory = (id?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.categories.detail(id || ""),
    queryFn: async () => {
      const response = await apiClient.get<ProductCategory>(
        `/products/categories/${id}`
      );
      return response;
    },
    enabled: Boolean(id),
  });
};

/**
 * Fetch all product attributes
 * GET /products/attributes
 */
export const useProductAttributes = () => {
  return useQuery({
    queryKey: productsQueryKeys.attributes.all,
    queryFn: async () => {
      const response = await apiClient.get<ProductAttribute[]>(
        "/products/attributes"
      );
      return response;
    },
  });
};

/**
 * Fetch filterable attributes (for search/filter UI)
 * GET /products/attributes/filterable
 */
export const useFilterableAttributes = () => {
  return useQuery({
    queryKey: productsQueryKeys.attributes.filterable(),
    queryFn: async () => {
      const response = await apiClient.get<ProductAttribute[]>(
        "/products/attributes/filterable"
      );
      return response;
    },
  });
};

/**
 * Fetch variant attributes (attributes used for variant generation)
 * GET /products/attributes/variant
 */
export const useVariantAttributes = () => {
  return useQuery({
    queryKey: productsQueryKeys.attributes.variant(),
    queryFn: async () => {
      const response = await apiClient.get<ProductAttribute[]>(
        "/products/attributes/variant"
      );
      return response;
    },
  });
};

/**
 * Fetch single attribute by ID
 * GET /products/attributes/:id
 */
export const useProductAttribute = (id?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.attributes.detail(id || ""),
    queryFn: async () => {
      const response = await apiClient.get<ProductAttribute>(
        `/products/attributes/${id}`
      );
      return response;
    },
    enabled: Boolean(id),
  });
};

/**
 * Fetch variants for a product
 * GET /products/:productId/variants
 */
export const useProductVariants = (productId?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.variants.all(productId || ""),
    queryFn: async () => {
      const response = await apiClient.get<ProductVariant[]>(
        `/products/${productId}/variants`
      );
      return response;
    },
    enabled: Boolean(productId),
  });
};

/**
 * Fetch single variant by ID
 * GET /products/:productId/variants/:variantId
 */
export const useProductVariant = (productId?: string, variantId?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.variants.detail(
      productId || "",
      variantId || ""
    ),
    queryFn: async () => {
      const response = await apiClient.get<ProductVariant>(
        `/products/${productId}/variants/${variantId}`
      );
      return response;
    },
    enabled: Boolean(productId && variantId),
  });
};

/**
 * Check stock for a product
 * GET /inventory/stock/check/:productId
 */
export const useStockByProduct = (productId?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.stock.byProduct(productId || ""),
    queryFn: async () => {
      const response = await apiClient.get<StockQuant[]>(
        `/inventory/stock/check/${productId}`
      );
      return response;
    },
    enabled: Boolean(productId),
  });
};

/**
 * Get stock by location
 * GET /inventory/stock/location/:locationId
 */
export const useStockByLocation = (locationId?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.stock.byLocation(locationId || ""),
    queryFn: async () => {
      const response = await apiClient.get<StockQuant[]>(
        `/inventory/stock/location/${locationId}`
      );
      return response;
    },
    enabled: Boolean(locationId),
  });
};

/**
 * Get stock ledger (movement history)
 * GET /inventory/reports/stock-ledger
 */
export const useStockLedger = (filters?: StockLedgerQueryDto) => {
  return useQuery({
    queryKey: productsQueryKeys.stock.ledger(filters),
    queryFn: async () => {
      const response = await apiClient.get<StockLedgerEntry[]>(
        "/inventory/reports/stock-ledger",
        {
          params: filters,
        }
      );
      return response;
    },
    enabled: Boolean(
      filters?.productId || filters?.locationId || filters?.startDate
    ),
  });
};

/**
 * Get stock valuation
 * GET /inventory/reports/valuation
 */
export const useStockValuation = (filters?: StockValuationQueryDto) => {
  return useQuery({
    queryKey: productsQueryKeys.stock.valuation(filters),
    queryFn: async () => {
      const response = await apiClient.get<
        Array<{
          productId: string;
          productName: string;
          quantity: number;
          unitCost: number;
          totalValue: number;
        }>
      >("/inventory/reports/valuation", {
        params: filters,
      });
      return response;
    },
  });
};

/**
 * Fetch all stock locations
 * GET /inventory/locations
 */
export const useStockLocations = () => {
  return useQuery({
    queryKey: productsQueryKeys.locations.all,
    queryFn: async () => {
      const response = await apiClient.get<StockLocation[]>(
        "/inventory/locations"
      );
      return response;
    },
  });
};

/**
 * Fetch single location by ID with stock
 * GET /inventory/locations/:id
 */
export const useStockLocation = (id?: string) => {
  return useQuery({
    queryKey: productsQueryKeys.locations.detail(id || ""),
    queryFn: async () => {
      const response = await apiClient.get<StockLocation>(
        `/inventory/locations/${id}`
      );
      return response;
    },
    enabled: Boolean(id),
  });
};
