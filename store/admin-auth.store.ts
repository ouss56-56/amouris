'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginAdmin, logout as apiLogout, getCurrentUser } from '@/lib/api/auth'
import { Session } from '@supabase/supabase-js'

interface AdminAuthStore {
  isAuthenticated: boolean
  email: string | null
  adminEmail: string | null // compatibility
  isLoading: boolean
  error: string | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  setSession: (session: Session | null) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      adminEmail: null,
      isLoading: false,
      error: null,
      session: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { ok, error } = await loginAdmin(email, password)
          if (!ok) throw new Error(error)
          set({ isAuthenticated: true, email, adminEmail: email, isLoading: false })
          return { ok: true }
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          return { ok: false, error: err.message }
        }
      },

      setSession: async (session) => {
        if (!session) {
          set({ session: null, isAuthenticated: false, email: null, adminEmail: null })
          return
        }

        set({ session, isLoading: true })
        try {
          const data = await getCurrentUser()
          if (data?.profile?.role === 'admin') {
            set({ 
              isAuthenticated: true, 
              email: data.user.email || null, 
              adminEmail: data.user.email || null,
              isLoading: false 
            })
          } else {
            set({ isAuthenticated: false, email: null, adminEmail: null, isLoading: false })
          }
        } catch {
          set({ isAuthenticated: false, email: null, adminEmail: null, isLoading: false })
        }
      },

      logout: async () => {
        await apiLogout()
        set({ isAuthenticated: false, email: null, adminEmail: null, session: null })
      },

      checkSession: async () => {
        try {
          const data = await getCurrentUser()
          if (data?.profile?.role === 'admin') {
            set({ isAuthenticated: true, email: data.user.email || null, adminEmail: data.user.email || null })
          } else {
            set({ isAuthenticated: false, email: null, adminEmail: null })
          }
        } catch {
          set({ isAuthenticated: false, email: null, adminEmail: null })
        }
      }
    }),
    {
      name: 'amouris_admin_session',
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated, email: s.email }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

export const useAdminAuth = useAdminAuthStore
