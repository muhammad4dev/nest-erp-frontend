import Dexie, { type EntityTable } from "dexie";

/**
 * POS Offline Database Schema
 * Stores cart items and pending orders for offline functionality
 */

export interface POSCartItem {
  id?: number; // Auto-increment ID
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface POSPendingOrder {
  id: string; // UUID v7 (client-generated)
  partnerId: string;
  partnerName: string;
  orderDate: string;
  lines: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountRate: number;
  }>;
  totalAmount: number;
  status: "pending" | "syncing" | "synced" | "failed";
  createdAt: Date;
  syncAttempts: number;
  lastSyncError?: string;
}

export interface POSSession {
  id?: number;
  startedAt: Date;
  endedAt?: Date;
  totalOrders: number;
  totalRevenue: number;
  status: "active" | "closed";
}

class POSDatabase extends Dexie {
  // TypeScript table definitions
  cartItems!: EntityTable<POSCartItem, "id">;
  pendingOrders!: EntityTable<POSPendingOrder, "id">;
  sessions!: EntityTable<POSSession, "id">;

  constructor() {
    super("POSDatabase");

    // Define schema
    this.version(1).stores({
      cartItems: "++id, productId, createdAt",
      pendingOrders: "id, status, createdAt, partnerId",
      sessions: "++id, startedAt, status",
    });
  }

  /**
   * Clear all cart items
   */
  async clearCart(): Promise<void> {
    await this.cartItems.clear();
  }

  /**
   * Get current cart total
   */
  async getCartTotal(): Promise<number> {
    const items = await this.cartItems.toArray();
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  /**
   * Get all pending orders that need to be synced
   */
  async getPendingOrders(): Promise<POSPendingOrder[]> {
    return this.pendingOrders
      .where("status")
      .equals("pending")
      .or("status")
      .equals("failed")
      .toArray();
  }

  /**
   * Mark order as synced
   */
  async markOrderSynced(orderId: string): Promise<void> {
    await this.pendingOrders.update(orderId, { status: "synced" });
  }

  /**
   * Mark order as failed with error
   */
  async markOrderFailed(orderId: string, error: string): Promise<void> {
    const order = await this.pendingOrders.get(orderId);
    if (order) {
      await this.pendingOrders.update(orderId, {
        status: "failed",
        lastSyncError: error,
        syncAttempts: order.syncAttempts + 1,
      });
    }
  }

  /**
   * Get current active session
   */
  async getActiveSession(): Promise<POSSession | undefined> {
    return this.sessions.where("status").equals("active").first();
  }

  /**
   * Start a new POS session
   */
  async startSession(): Promise<number> {
    const id = await this.sessions.add({
      startedAt: new Date(),
      totalOrders: 0,
      totalRevenue: 0,
      status: "active",
    });
    return id as number;
  }

  /**
   * Close the current session
   */
  async closeSession(): Promise<void> {
    const session = await this.getActiveSession();
    if (session && session.id) {
      await this.sessions.update(session.id, {
        endedAt: new Date(),
        status: "closed",
      });
    }
  }

  /**
   * Increment session order count and revenue
   */
  async recordOrder(amount: number): Promise<void> {
    const session = await this.getActiveSession();
    if (session && session.id) {
      await this.sessions.update(session.id, {
        totalOrders: session.totalOrders + 1,
        totalRevenue: session.totalRevenue + amount,
      });
    }
  }
}

// Export singleton instance
export const posDB = new POSDatabase();
