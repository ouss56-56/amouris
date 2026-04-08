'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StoreSettings {
  storeNameFR: string
  storeNameAR: string
  sloganFR: string
  sloganAR: string
  email: string
  phone: string
  address: string
  wilaya: string
  instagram: string
  facebook: string
  freeDeliveryThreshold: number
  alertStockPerfume: number
  alertStockFlacon: number
  minOrderAmount: number
}

interface SettingsStore extends StoreSettings {
  updateSettings: (updates: Partial<StoreSettings>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      storeNameFR: "Amouris Parfums",
      storeNameAR: "أموريس للعطور",
      sloganFR: "L'essence du luxe — Huiles et flacons d'exception",
      sloganAR: "جوهر الفخامة — زيوت وقوارير استثنائية",
      email: "contact@amouris-parfums.com",
      phone: "+213 550 00 00 00",
      address: "Quartier El Yasmine, Alger",
      wilaya: "Alger",
      instagram: "",
      facebook: "",
      freeDeliveryThreshold: 50000,
      alertStockPerfume: 500,
      alertStockFlacon: 10,
      minOrderAmount: 0,
      
      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'amouris_settings',
    }
  )
)
