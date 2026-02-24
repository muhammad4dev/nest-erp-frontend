import { v7 as uuidv7 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Partner, Product } from "@/types/api.types";

import { posDB } from "./posDatabase";

interface CartLine {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountRate: number;
}

interface POSState {
  // Cart state
  cartLines: CartLine[];
  selectedCustomer: Partner | null;

  // Session state
  sessionActive: boolean;
  sessionId: number | null;

  // UI state
  isOffline: boolean;
  syncInProgress: boolean;
  lastSyncTime: Date | null;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartLine: (productId: string, updates: Partial<CartLine>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCustomer: (customer: Partner | null) => void;

  // Session actions
  startSession: () => Promise<void>;
  closeSession: () => Promise<void>;

  // Checkout
  checkout: () => Promise<string>; // Returns order ID

  // Sync
  setOfflineStatus: (offline: boolean) => void;
  syncPendingOrders: () => Promise<void>;

  // Calculations
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;
  getLineTotal: (line: CartLine) => number;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial state
      cartLines: [],
      selectedCustomer: null,
      sessionActive: false,
      sessionId: null,
      isOffline: !navigator.onLine,
      syncInProgress: false,
      lastSyncTime: null,

      // Cart actions
      addToCart: (product, quantity = 1) => {
        const { cartLines } = get();
        const existingIndex = cartLines.findIndex(
          (line) => line.productId === product.id,
        );

        if (existingIndex >= 0) {
          // Update existing line
          const updated = [...cartLines];
          updated[existingIndex].quantity += quantity;
          set({ cartLines: updated });
        } else {
          // Add new line
          set({
            cartLines: [
              ...cartLines,
              {
                productId: product.id,
                product,
                quantity,
                unitPrice: product.salesPrice,
                discountRate: 0,
              },
            ],
          });
        }

        // Persist to IndexedDB
        void posDB.cartItems.add({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity,
          unitPrice: product.salesPrice,
          discountRate: 0,
          subtotal: product.salesPrice * quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      },

      updateCartLine: (productId, updates) => {
        const { cartLines } = get();
        const updated = cartLines.map((line) =>
          line.productId === productId ? { ...line, ...updates } : line,
        );
        set({ cartLines: updated });
      },

      removeFromCart: (productId) => {
        const { cartLines } = get();
        set({
          cartLines: cartLines.filter((line) => line.productId !== productId),
        });

        // Remove from IndexedDB
        void posDB.cartItems.where("productId").equals(productId).delete();
      },

      clearCart: () => {
        set({ cartLines: [], selectedCustomer: null });
        void posDB.clearCart();
      },

      setCustomer: (customer) => {
        set({ selectedCustomer: customer });
      },

      // Session management
      startSession: async () => {
        const sessionId = await posDB.startSession();
        set({ sessionActive: true, sessionId });
      },

      closeSession: async () => {
        await posDB.closeSession();
        set({ sessionActive: false, sessionId: null });
      },

      // Checkout
      checkout: async () => {
        const { cartLines, selectedCustomer } = get();

        if (!selectedCustomer) {
          throw new Error("Please select a customer");
        }

        if (cartLines.length === 0) {
          throw new Error("Cart is empty");
        }

        // Generate UUID v7 (time-ordered)
        const orderId = uuidv7();
        const orderDate = new Date().toISOString();
        const totalAmount = get().getCartTotal();

        // Save to pending orders
        await posDB.pendingOrders.add({
          id: orderId,
          partnerId: selectedCustomer.id,
          partnerName: selectedCustomer.name,
          orderDate,
          lines: cartLines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountRate: line.discountRate,
          })),
          totalAmount,
          status: "pending",
          createdAt: new Date(),
          syncAttempts: 0,
        });

        // Record in session
        await posDB.recordOrder(totalAmount);

        // Clear cart
        get().clearCart();

        // Trigger sync if online
        if (!get().isOffline) {
          void get().syncPendingOrders();
        }

        return orderId;
      },

      // Sync management
      setOfflineStatus: (offline) => {
        set({ isOffline: offline });

        // Auto-sync when coming back online
        if (!offline) {
          void get().syncPendingOrders();
        }
      },

      syncPendingOrders: async () => {
        const { syncInProgress, isOffline } = get();

        if (syncInProgress || isOffline) {
          return;
        }

        set({ syncInProgress: true });

        try {
          const pendingOrders = await posDB.getPendingOrders();

          if (pendingOrders.length === 0) {
            set({ syncInProgress: false, lastSyncTime: new Date() });
            return;
          }

          // Import sync function dynamically to avoid circular dependencies
          const { syncPOSOrders } = await import("./posSyncService");

          for (const order of pendingOrders) {
            try {
              await syncPOSOrders([
                {
                  id: order.id,
                  partnerId: order.partnerId,
                  orderDate: order.orderDate,
                  lines: order.lines,
                },
              ]);

              await posDB.markOrderSynced(order.id);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              await posDB.markOrderFailed(order.id, errorMessage);
            }
          }

          set({ syncInProgress: false, lastSyncTime: new Date() });
        } catch (error) {
          console.error("Sync failed:", error);
          set({ syncInProgress: false });
        }
      },

      // Calculations
      getCartSubtotal: () => {
        const { cartLines } = get();
        return cartLines.reduce(
          (sum, line) => sum + line.quantity * line.unitPrice,
          0,
        );
      },

      getCartDiscount: () => {
        const { cartLines } = get();
        return cartLines.reduce((sum, line) => {
          const subtotal = line.quantity * line.unitPrice;
          return sum + subtotal * (line.discountRate / 100);
        }, 0);
      },

      getCartTotal: () => {
        return get().getCartSubtotal() - get().getCartDiscount();
      },

      getLineTotal: (line) => {
        const subtotal = line.quantity * line.unitPrice;
        const discount = subtotal * (line.discountRate / 100);
        return subtotal - discount;
      },
    }),
    {
      name: "pos-store",
      partialize: (state) => ({
        sessionActive: state.sessionActive,
        sessionId: state.sessionId,
        lastSyncTime: state.lastSyncTime,
      }),
    },
  ),
);

// Online/offline event listeners
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    usePOSStore.getState().setOfflineStatus(false);
  });

  window.addEventListener("offline", () => {
    usePOSStore.getState().setOfflineStatus(true);
  });
}
