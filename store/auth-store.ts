import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../lib/types';

interface AuthStore {
  user: Customer | null;
  isAdmin: boolean;
  setUser: (customer: Customer | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      setUser: (customer) => set({ user: customer }),
      setAdmin: (isAdmin) => set({ isAdmin }),
      logout: () => set({ user: null, isAdmin: false }),
    }),
    {
      name: 'amouris-auth-v2',
    }
  )
);

