'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Customer } from './customers.store'
import { authApi } from '@/lib/api/auth.api'

interface CustomerAuthStore {
  customer: Customer | null
  currentCustomer: Customer | null // compatibility alias
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (phone: string, password?: string) => Promise<void>
  register: (data: any) => Promise<void>
  setCustomer: (c: Customer | null) => void
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useCustomerAuthStore = create<CustomerAuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      currentCustomer: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phone, password) => {
        set({ isLoading: true, error: null })
        try {
          const { profile } = await authApi.loginCustomer(phone, password)
          set({ 
            customer: profile as any, 
            currentCustomer: profile as any, 
            isAuthenticated: true,
            isLoading: false 
          })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.registerCustomer(data)
          await get().login(data.phone, data.password)
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      setCustomer: (c) => set({ 
        customer: c, 
        currentCustomer: c, 
        isAuthenticated: !!c 
      }),

      logout: async () => {
        await authApi.logout()
        set({ 
          customer: null, 
          currentCustomer: null, 
          isAuthenticated: false 
        })
      },

      checkSession: async () => {
        try {
          const data = await authApi.getCurrentUser()
          if (data?.profile) {
            set({ 
              customer: data.profile as any, 
              currentCustomer: data.profile as any, 
              isAuthenticated: true 
            })
          } else {
            set({ customer: null, currentCustomer: null, isAuthenticated: false })
          }
        } catch {
          set({ customer: null, currentCustomer: null, isAuthenticated: false })
        }
      }
    }),
    {
      name: 'amouris_customer_session',
    }
  )
)

export const useCustomerAuth = useCustomerAuthStore
