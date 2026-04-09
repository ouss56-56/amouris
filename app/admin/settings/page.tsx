'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Save, Globe, Mail, 
  MapPin, Phone, 
  AlertTriangle, CreditCard, Loader2, 
  CheckCircle2, Plus, Trash2, Megaphone,
  LogOut, User, ExternalLink, GripVertical,
  ChevronUp, ChevronDown, Check, X, Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettingsStore, StoreSettings } from '@/store/settings.store'
import { useAnnouncementsStore, Announcement } from '@/store/announcements.store'
import { useAdminAuthStore } from '@/store/admin-auth.store'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa",
  "Ouled Djellal", "Bordj Baji Mokhtar", "Beni Abbes", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
]

export default function AdminSettingsPage() {
  const settingsStore = useSettingsStore()
  const announcementsStore = useAnnouncementsStore()
  const authStore = useAdminAuthStore()
  const router = useRouter()
  
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

  // Announcement Draft State
  const [annDraft, setAnnDraft] = useState<Omit<Announcement, 'id'>>({
    text_fr: '',
    text_ar: '',
    is_active: true,
    display_order: 0
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
    await new Promise(r => setTimeout(r, 600))
    settingsStore.updateSettings(formData)
    setLoading(false)
    toast.success('Paramètres enregistrés avec succès')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleLogout = () => {
    authStore.logout()
    router.push('/admin/login')
    toast.info('Session terminée')
  }

  const handleAddAnnouncement = () => {
    if (!annDraft.text_fr || !annDraft.text_ar) {
      toast.error('Veuillez remplir les textes FR et AR')
      return
    }
    announcementsStore.add({
      ...annDraft,
      display_order: announcementsStore.announcements.length
    })
    setAnnDraft({ text_fr: '', text_ar: '', is_active: true, display_order: 0 })
    toast.success('Annonce ajoutée')
  }

  if (!mounted) return null;

  const tabs = [
    { id: 'Boutique', label: 'Boutique', icon: Globe },
    { id: 'Social', label: 'Réseaux Sociaux', icon: Camera },
    { id: 'Logistique', label: 'Livraison & Stocks', icon: CreditCard },
    { id: 'Annonces', label: 'Annonces', icon: Megaphone },
    { id: 'Compte', label: 'Compte Admin', icon: User },
  ]

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="font-serif text-3xl text-emerald-950 mb-1 font-bold italic">Paramètres Système</h1>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Configuration fonctionnelle globale</p>
        </div>
        {activeTab !== 'Compte' && activeTab !== 'Annonces' && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="group bg-[#0a3d2e] text-white px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:rotate-12 transition-transform" />}
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <nav className="flex flex-col gap-2">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`h-14 px-6 rounded-xl flex items-center gap-4 transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-emerald-950 text-white shadow-lg' : 'bg-white text-emerald-950/40 hover:bg-neutral-50 hover:text-emerald-950 border border-emerald-950/5'}`}
             >
               <tab.icon size={16} />
               {tab.label}
             </button>
           ))}
        </nav>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-emerald-950/5 shadow-xl space-y-10"
            >
              {activeTab === 'Boutique' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                       <Globe size={18} className="text-[#C9A84C]" />
                       <h3 className="font-serif text-xl font-bold text-emerald-950">Identité Boutique</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Nom Boutique (FR)</label>
                         <input type="text" name="storeNameFR" value={formData.storeNameFR} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 text-right block">اسم المتجر (AR)</label>
                         <input type="text" name="storeNameAR" value={formData.storeNameAR} onChange={handleChange} dir="rtl" className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl font-arabic text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Slogan (FR)</label>
                         <input type="text" name="sloganFR" value={formData.sloganFR} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 text-right block">شعار المتجر (AR)</label>
                         <input type="text" name="sloganAR" value={formData.sloganAR} onChange={handleChange} dir="rtl" className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl font-arabic text-emerald-950 outline-none focus:border-[#C9A84C] transition-all" />
                       </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                       <Mail size={18} className="text-[#C9A84C]" />
                       <h3 className="font-serif text-xl font-bold text-emerald-950">Contact & Adresse</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Email de Contact</label>
                         <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-600 transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Téléphone</label>
                         <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-600 transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Adresse</label>
                         <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-600 transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Wilaya</label>
                         <select name="wilaya" value={formData.wilaya} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-600 transition-all">
                            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                         </select>
                       </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Social' && (
                <section className="space-y-8">
                   <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                      <Camera size={18} className="text-rose-600" />
                      <h3 className="font-serif text-xl font-bold text-emerald-950">Réseaux Sociaux</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Lien Instagram</label>
                         <div className="flex gap-4">
                            <div className="relative flex-1">
                              <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={16} />
                              <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full h-12 pl-12 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-rose-500 transition-all" />
                            </div>
                            <button 
                              onClick={() => formData.instagram && window.open(formData.instagram, '_blank')}
                              disabled={!formData.instagram}
                              className="px-6 h-12 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider hover:bg-rose-100 transition-colors disabled:opacity-30"
                            >
                              Ouvrir <ExternalLink size={14} />
                            </button>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Lien Facebook</label>
                         <div className="flex gap-4">
                            <div className="relative flex-1">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                              <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full h-12 pl-12 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <button 
                              onClick={() => formData.facebook && window.open(formData.facebook, '_blank')}
                              disabled={!formData.facebook}
                              className="px-6 h-12 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider hover:bg-blue-100 transition-colors disabled:opacity-30"
                            >
                              Ouvrir <ExternalLink size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                </section>
              )}

              {activeTab === 'Logistique' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                       <CreditCard size={18} className="text-emerald-700" />
                       <h3 className="font-serif text-xl font-bold text-emerald-950">Livraison</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                         <label className="text-[8px] font-black uppercase text-emerald-950/30 block">Seuil Livraison Gratuite (DZD)</label>
                         <input type="number" name="freeDeliveryThreshold" value={formData.freeDeliveryThreshold} onChange={handleChange} className="w-full h-12 px-4 bg-white border border-emerald-100 rounded-xl font-bold text-emerald-950 outline-none" />
                         <p className="text-[10px] text-emerald-800/60 font-medium italic">S'affiche dans la barre d'annonces si {{threshold}} est utilisé.</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                       <AlertTriangle size={18} className="text-rose-600" />
                       <h3 className="font-serif text-xl font-bold text-emerald-950">Alertes Stock</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Seuil Alerte Parfums (g)</label>
                        <input type="number" name="alertStockPerfume" value={formData.alertStockPerfume} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Seuil Alerte Flacons (Unités)</label>
                        <input type="number" name="alertStockFlacon" value={formData.alertStockFlacon} onChange={handleChange} className="w-full h-12 px-5 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Annonces' && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-emerald-950/5 pb-4">
                    <div className="flex items-center gap-4">
                      <Megaphone size={18} className="text-amber-500" />
                      <h3 className="font-serif text-xl font-bold text-emerald-950">Annonces Storefront</h3>
                    </div>
                    <span className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">{announcementsStore.announcements.length} Annonce(s)</span>
                  </div>

                  {/* Add Form */}
                  <div className="p-6 bg-neutral-50 rounded-2xl border border-dashed border-emerald-950/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Texte Français..." 
                        value={annDraft.text_fr} 
                        onChange={e => setAnnDraft(p => ({...p, text_fr: e.target.value}))}
                        className="h-10 px-4 bg-white border border-emerald-950/5 rounded-xl text-[11px] outline-none"
                      />
                      <input 
                        dir="rtl"
                        placeholder="النص العربي..." 
                        value={annDraft.text_ar} 
                        onChange={e => setAnnDraft(p => ({...p, text_ar: e.target.value}))}
                        className="h-10 px-4 bg-white border border-emerald-950/5 rounded-xl text-[11px] font-arabic outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={annDraft.is_active} 
                            onChange={e => setAnnDraft(p => ({...p, is_active: e.target.checked}))}
                            className="w-4 h-4 rounded-md accent-emerald-600"
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-950/40 group-hover:text-emerald-950 transition-colors">Activer immédiatement</span>
                       </label>
                       <button 
                         onClick={handleAddAnnouncement}
                         className="px-6 h-10 bg-emerald-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                       >
                         <Plus size={14} /> Ajouter
                       </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-3">
                    {announcementsStore.announcements.length === 0 ? (
                      <div className="py-12 text-center text-emerald-950/30 italic text-xs">Aucune annonce configurée.</div>
                    ) : (
                      announcementsStore.announcements.sort((a,b) => a.display_order - b.display_order).map((ann, idx) => (
                        <div key={ann.id} className="group flex flex-col md:flex-row items-center gap-4 p-4 bg-white border border-emerald-950/5 rounded-2xl hover:border-emerald-950/20 transition-all">
                           <div className="hidden md:block text-emerald-950/20 group-hover:text-emerald-950 transition-colors cursor-grab"><GripVertical size={16} /></div>
                           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                              <input 
                                className="text-xs font-medium bg-transparent border-none focus:ring-0 focus:bg-neutral-50 rounded px-2 py-1 w-full"
                                value={ann.text_fr}
                                onChange={e => announcementsStore.update(ann.id, { text_fr: e.target.value })}
                                placeholder="Texte FR..."
                              />
                              <input 
                                className="text-xs font-arabic text-right bg-transparent border-none focus:ring-0 focus:bg-neutral-50 rounded px-2 py-1 w-full"
                                value={ann.text_ar}
                                onChange={e => announcementsStore.update(ann.id, { text_ar: e.target.value })}
                                placeholder="النص العربي..."
                                dir="rtl"
                              />
                           </div>
                           <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                              <button 
                                onClick={() => announcementsStore.update(ann.id, { is_active: !ann.is_active })}
                                title={ann.is_active ? "Désactiver" : "Activer"}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${ann.is_active ? 'bg-emerald-600' : 'bg-neutral-200'}`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${ann.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                              <button 
                                onClick={() => announcementsStore.remove(ann.id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'Compte' && (
                <section className="space-y-10">
                  <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-4">
                    <User size={18} className="text-[#C9A84C]" />
                    <h3 className="font-serif text-xl font-bold text-emerald-950">Compte Administrateur</h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center p-8 bg-neutral-50 rounded-3xl border border-emerald-950/5">
                    <div className="w-16 h-16 bg-emerald-950 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <User size={32} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30">Email de session</p>
                      <p className="text-lg font-bold text-emerald-950">{authStore.email || 'Admin'}</p>
                      <div className="flex items-center gap-2 text-emerald-600/60 text-[10px] font-bold">
                        <Check size={12} /> Privilèges super-utilisateur actifs
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full md:w-auto px-8 h-12 bg-white text-rose-600 border border-rose-100 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all font-bold group"
                    >
                      <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                      Déconnexion
                    </button>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50 flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
                      <Settings size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-amber-900 tracking-wider">Sécurité du compte</h4>
                      <p className="text-xs text-amber-900/60 leading-relaxed font-medium">La modification du mot de passe et de l'email n'est pas disponible dans cette version.</p>
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
