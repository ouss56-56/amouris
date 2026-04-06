import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderItem } from '../lib/types';

export interface CartItem extends OrderItem {
  cartItemId: string; // unique ID since same product could be added with different variants
  nameAR: string;
  nameFR: string;
  image: string;
  variantDescriptionLabel?: string; // For flacons, e.g., "50ml - Carré"
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        // Simple logic: if it's the specific variant/product again, update quantity instead, but let's just push unique cartItemIds or aggregate.
        // For simplicity, we just aggregate if productId & variantId match
        const existingIndex = state.items.findIndex(
          i => i.productId === item.productId && i.variantId === item.variantId
        );

        if (existingIndex > -1) {
          const newItems = [...state.items];
          newItems[existingIndex].quantity += item.quantity;
          return { items: newItems };
        }

        return { 
          items: [...state.items, { ...item, cartItemId: Math.random().toString(36).substring(7) }] 
        };
      }),
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter((item) => item.cartItemId !== cartItemId)
      })),
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map((item) => 
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ items: [] }),
      cartTotal: () => get().items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0),
      cartCount: () => get().items.length,
    }),
    {
      name: 'amouris-cart', // name of the item in the storage (must be unique)
    }
  )
);
