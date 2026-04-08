'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Customer } from '@/lib/types'
import { login as loginAction, logout as logoutAction } from '@/lib/actions/auth'
import { registerCustomer } from '@/lib/actions/customers'

interface CustomerAuthStore {
  currentCustomer: Customer | null
  customer: Customer | null // compatibility
  isAuthenticated: boolean
  setCustomer: (c: Customer) => void
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (data: any) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

export const useCustomerAuthStore = create<CustomerAuthStore>()(
  persist(
    (set, get) => ({
      currentCustomer: null,
      customer: null, // compatibility
      isAuthenticated: false,
      setCustomer: (c: Customer) => set({ currentCustomer: c, customer: c, isAuthenticated: true }),
      
      login: async (phone, password) => {
        try {
          const result = await loginAction(phone, password)
          if (result && result.profile) {
            const customerData = result.profile as Customer
            set({ 
              currentCustomer: customerData, 
              customer: customerData, 
              isAuthenticated: true 
            })
            return { ok: true }
          }
          return { ok: false, error: 'Identifiants incorrects' }
        } catch (err: any) {
          return { ok: false, error: err.message || 'Une erreur est survenue' }
        }
      },

      register: async (data: any): Promise<{ ok: boolean; error?: string }> => {
        try {
          await registerCustomer(data)
          // After successful registration, we log the user in
          return await get().login(data.phone, data.password)
        } catch (err: any) {
          return { ok: false, error: err.message || 'Échec de la création du compte' }
        }
      },

      logout: async () => {
        await logoutAction()
        set({ currentCustomer: null, customer: null, isAuthenticated: false })
      },
    }),
    {
      name: 'amouris_customer_session',
      partialize: (s) => ({ 
        currentCustomer: s.currentCustomer, 
        isAuthenticated: s.isAuthenticated,
        customer: s.customer 
      }),
    }
  )
)

export const useCustomerAuth = useCustomerAuthStore

