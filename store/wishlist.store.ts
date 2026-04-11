import { create } from 'zustand';
import { fetchWishlist, toggleWishlistItem } from '@/lib/api/wishlist';

interface WishlistState {
  items: string[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const items = await fetchWishlist();
      set({ items, isLoading: false });
    } catch (err) {
      console.error('Error in wishlist store:', err);
      set({ isLoading: false });
    }
  },
  toggleItem: async (productId: string) => {
    try {
      const added = await toggleWishlistItem(productId);
      const currentItems = get().items;
      if (added) {
        set({ items: [...currentItems, productId] });
      } else {
        set({ items: currentItems.filter(id => id !== productId) });
      }
    } catch (err) {
      console.error('Error toggling wishlist item:', err);
    }
  },
  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  }
}));
