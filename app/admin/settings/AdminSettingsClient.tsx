'use client'

import { useState } from 'react'
import { 
  Settings, Save, Globe, Mail, 
  MapPin, Phone, 
  AlertTriangle, CreditCard, Loader2, 
  Plus, Trash2, Megaphone,
  LogOut, User, ExternalLink,
  Check, Camera, ShieldCheck, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { StoreSettings } from '@/store/settings.store'
import { useAdminAuthStore } from '@/store/admin-auth.store'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { updateSettings as apiUpdateSettings } from '@/lib/api/settings'
import { updatePasswordAction } from '@/lib/actions/auth.actions'

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa",
  "Ouled Djellal", "Bordj Baji Mokhtar", "Beni Abbes", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
]

interface AdminSettingsClientProps {
  initialSettings: StoreSettings
  initialAnnouncements: any[]
}

export default function AdminSettingsClient({ initialSettings, initialAnnouncements }: AdminSettingsClientProps) {
  const router = useRouter()
  const authStore = useAdminAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Boutique')
  
  const [formData, setFormData] = useState<StoreSettings>(initialSettings)
  
  // Password change state
  const [passwords, setPasswords] = useState({ new: '', confirm: '' })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await apiUpdateSettings(formData)
      router.refresh()
      toast.success('Paramètres enregistrés avec succès')
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde: ' + err.message)
    } finally {
      setLoading(false)
    }
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

  const handlePasswordChange = async () => {
    if (!passwords.new || !passwords.confirm) {
        toast.error('Veuillez remplir tous les champs')
        return
    }
    if (passwords.new !== passwords.confirm) {
        toast.error('Les mots de passe ne correspondent pas')
        return
    }
    if (passwords.new.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères')
        return
    }

    setIsUpdatingPassword(true)
    try {
        const res = await updatePasswordAction(passwords.new)
        if (res.success) {
            toast.success('Mot de passe mis à jour avec succès')
            setPasswords({ new: '', confirm: '' })
        } else {
            throw new Error(res.error)
        }
    } catch (err: any) {
        toast.error('Erreur: ' + err.message)
    } finally {
        setIsUpdatingPassword(false)
    }
  }


  const tabs = [
    { id: 'Boutique', label: 'Boutique', icon: Globe },
    { id: 'Social', label: 'Réseaux Sociaux', icon: Camera },

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
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Lien Facebook</label>
                         <div className="flex gap-4">
                            <div className="relative flex-1">
                               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                               <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full h-12 pl-12 bg-neutral-50 border border-emerald-950/5 rounded-xl text-emerald-950 outline-none focus:border-blue-500 transition-all" />
                            </div>
                         </div>
                      </div>
                   </div>
                </section>
              )}

              {activeTab === 'Annonces' && (
                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="p-16 border-2 border-dashed border-emerald-950/5 rounded-[3.5rem] text-center space-y-8 bg-neutral-50/30">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-[#C9A84C]">
                      <Megaphone size={40} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold font-serif text-emerald-950 mb-3 italic">Gestion des Annonces</h3>
                      <p className="text-emerald-950/40 max-w-md mx-auto italic text-sm">
                        La gestion des annonces a été déplacée vers un module dédié pour supporter les mises à jour en temps réel.
                      </p>
                    </div>
                    <Link href="/admin/announcements">
                      <button className="h-16 px-12 bg-emerald-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-[#C9A84C] transition-all flex items-center gap-4 mx-auto">
                        Ouvrir le Module <ArrowUpRight size={18} />
                      </button>
                    </Link>
                  </div>
                </section>
              )}

              {activeTab === 'Compte' && (
                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 border-b border-emerald-950/5 pb-6">
                    <User size={24} className="text-[#C9A84C]" />
                    <h3 className="font-serif text-2xl font-bold text-emerald-950 italic">Sécurité du Compte</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-emerald-950/5 shadow-xl shadow-emerald-900/5">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Nouveau mot de passe</label>
                        <input 
                          type="password"
                          value={passwords.new}
                          onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                          className="w-full h-16 px-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl text-sm focus:border-[#C9A84C] outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Confirmer le mot de passe</label>
                        <input 
                          type="password"
                          value={passwords.confirm}
                          onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                          className="w-full h-16 px-6 bg-neutral-50 border border-emerald-950/5 rounded-2xl text-sm focus:border-[#C9A84C] outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <button 
                        onClick={handlePasswordChange}
                        disabled={isUpdatingPassword}
                        className="w-full h-16 bg-emerald-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        Mettre à jour la sécurité
                      </button>
                    </div>

                    <div className="p-10 bg-amber-50/50 rounded-[2.5rem] border border-amber-100/50 space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-white shadow-lg flex items-center justify-center text-[#C9A84C]">
                        <AlertTriangle size={28} />
                      </div>
                      <h4 className="font-bold font-serif text-xl text-emerald-950 italic">Politique de Sécurité</h4>
                      <div className="space-y-4 text-sm text-emerald-950/60 leading-relaxed italic">
                        <p>Pour garantir l&apos;intégrité de votre plateforme Amouris, nous recommandons :</p>
                        <ul className="space-y-3 pl-4 border-l-2 border-amber-200">
                          <li>• Un mot de passe de 12 caractères minimum</li>
                          <li>• L&apos;utilisation de caractères spéciaux (!@#)</li>
                          <li>• De ne jamais partager vos accès administrateur</li>
                        </ul>
                      </div>
                      <div className="pt-6 border-t border-amber-200/50">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:text-rose-700 transition-colors"
                        >
                          <LogOut size={16} /> Déconnexion sécurisée
                        </button>
                      </div>
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
