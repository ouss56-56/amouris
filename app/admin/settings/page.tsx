'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Save, Globe, Mail, 
  MapPin, Phone, Instagram, Facebook, 
  AlertTriangle, CreditCard, Image as ImageIcon,
  Loader2, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettingsStore, StoreSettings } from '@/store/settings.store'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminSettingsPage() {
  const settingsStore = useSettingsStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Boutique')
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState<StoreSettings>({
    storeNameFR: '',
    storeNameAR: '',
    sloganFR: '',
    sloganAR: '',
    email: '',
    phone: '',
    address: '',
    wilaya: '',
    instagram: '',
    facebook: '',
    freeDeliveryThreshold: 0,
    alertStockPerfume: 0,
    alertStockFlacon: 0,
    minOrderAmount: 0,
  })

  useEffect(() => {
    setFormData({
      storeNameFR: settingsStore.storeNameFR,
      storeNameAR: settingsStore.storeNameAR,
      sloganFR: settingsStore.sloganFR,
      sloganAR: settingsStore.sloganAR,
      email: settingsStore.email,
      phone: settingsStore.phone,
      address: settingsStore.address,
      wilaya: settingsStore.wilaya,
      instagram: settingsStore.instagram,
      facebook: settingsStore.facebook,
      freeDeliveryThreshold: settingsStore.freeDeliveryThreshold,
      alertStockPerfume: settingsStore.alertStockPerfume,
      alertStockFlacon: settingsStore.alertStockFlacon,
      minOrderAmount: settingsStore.minOrderAmount,
    })
    setMounted(true)
  }, [settingsStore])

  const handleSave = async () => {
    setLoading(true)
    // Artificial delay for premium feel
    await new Promise(r => setTimeout(r, 800))
    settingsStore.updateSettings(formData)
    setLoading(false)
    toast.success('Configuration Amouris mise à jour')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  if (!mounted) return null;

  const tabs = [
    { id: 'Boutique', label: 'Identité', icon: Globe },
    { id: 'Social', label: 'Réseaux', icon: Instagram },
    { id: 'Regles', label: 'Logistique', icon: CreditCard },
  ]

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bolditalic">Configuration Système</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Paramétrage global de l'expérience B2B</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#0a3d2e] text-white px-10 h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Synchronisation...' : 'Enregistrer les modifications'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <nav className="flex flex-col gap-2">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`h-16 px-8 rounded-2xl flex items-center gap-4 transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-emerald-950 text-white shadow-xl' : 'bg-white text-emerald-950/40 hover:bg-neutral-50 hover:text-emerald-950 border border-emerald-950/5 shadow-sm'}`}
             >
               <tab.icon size={18} />
               {tab.label}
             </button>
           ))}
        </nav>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 space-y-12"
          >
            {activeTab === 'Boutique' && (
              <>
                <section className="space-y-8">
                   <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                      <Globe size={20} className="text-[#C9A84C]" />
                      <h3 className="font-serif text-2xl font-bold text-emerald-950">Identité Visuelle & Nom</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Nom de la Maison (FR)</label>
                        <input type="text" name="storeNameFR" value={formData.storeNameFR} onChange={handleChange} className="w-full h-14 pl-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1 text-right block">اسم المتجر (AR)</label>
                        <input type="text" name="storeNameAR" value={formData.storeNameAR} onChange={handleChange} dir="rtl" className="w-full h-14 pr-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold font-arabic text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Slogan Principal (FR)</label>
                        <input type="text" name="sloganFR" value={formData.sloganFR} onChange={handleChange} className="w-full h-14 pl-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1 text-right block">شعار المتجر (AR)</label>
                        <input type="text" name="sloganAR" value={formData.sloganAR} onChange={handleChange} dir="rtl" className="w-full h-14 pr-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold font-arabic text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                      </div>
                   </div>
                </section>

                <section className="space-y-8">
                   <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                      <MapPin size={20} className="text-[#C9A84C]" />
                      <h3 className="font-serif text-2xl font-bold text-emerald-950">Coordonnées & Siège</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Email de Contact</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-14 pl-12 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-emerald-600 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Téléphone Support</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-14 pl-12 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-emerald-600 transition-all" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Adresse Physique</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full h-14 pl-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-emerald-600 transition-all" />
                      </div>
                   </div>
                </section>
              </>
            )}

            {activeTab === 'Social' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                    <Instagram size={20} className="text-rose-600" />
                    <h3 className="font-serif text-2xl font-bold text-emerald-950">Présence Sociale</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Lien Instagram</label>
                       <div className="relative">
                         <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                         <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full h-16 pl-16 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-rose-500 transition-all" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Lien Facebook</label>
                       <div className="relative">
                         <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                         <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full h-16 pl-16 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-blue-500 transition-all" />
                       </div>
                    </div>
                 </div>
              </section>
            )}

            {activeTab === 'Regles' && (
              <section className="space-y-10">
                 <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                    <CreditCard size={20} className="text-emerald-700" />
                    <h3 className="font-serif text-2xl font-bold text-emerald-950">Politique de Vente & Stocks</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4">
                       <div className="flex items-center gap-2 text-emerald-900 mb-2">
                          <CheckCircle2 size={16} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Seuils Financiers</h4>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-1">
                             <label className="text-[8px] font-black uppercase text-emerald-950/30">Livraison Gratuite dès (DZD)</label>
                             <input type="number" name="freeDeliveryThreshold" value={formData.freeDeliveryThreshold} onChange={handleChange} className="w-full h-12 px-4 bg-white border border-emerald-100 rounded-xl font-bold text-emerald-950 outline-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-black uppercase text-emerald-950/30">Panier Minimum (DZD)</label>
                             <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full h-12 px-4 bg-white border border-emerald-100 rounded-xl font-bold text-emerald-950 outline-none" />
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4">
                       <div className="flex items-center gap-2 text-rose-900 mb-2">
                          <AlertTriangle size={16} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Alertes Inventaire</h4>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-1">
                             <label className="text-[8px] font-black uppercase text-rose-950/30">Stock Critique Parfums (g)</label>
                             <input type="number" name="alertStockPerfume" value={formData.alertStockPerfume} onChange={handleChange} className="w-full h-12 px-4 bg-white border border-rose-100 rounded-xl font-bold text-rose-950 outline-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-black uppercase text-rose-950/30">Stock Critique Flacons (Un.)</label>
                             <input type="number" name="alertStockFlacon" value={formData.alertStockFlacon} onChange={handleChange} className="w-full h-12 px-4 bg-white border border-rose-100 rounded-xl font-bold text-rose-950 outline-none" />
                          </div>
                       </div>
                    </div>
                 </div>
              </section>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
