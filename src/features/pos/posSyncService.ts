import { apiClient } from "@/lib/api/client";
import type { POSSyncResult, SyncOrderDto } from "@/types/api.types";

/**
 * Sync POS orders to backend
 * @param orders Array of offline orders to sync
 * @returns Sync result with success/failure counts
 */
export async function syncPOSOrders(
  orders: SyncOrderDto[],
): Promise<POSSyncResult> {
  const response = await apiClient.post<POSSyncResult>("/sales/pos/sync", {
    orders,
  });

  return response;
}

/**
 * Check if backend is reachable
 */
export async function checkBackendConnection(): Promise<boolean> {
  try {
    await apiClient.get("/health");
    return true;
  } catch {
    return false;
  }
}
