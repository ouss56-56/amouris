'use client'

import { useState, useMemo } from 'react'
import { 
  Search, User, MapPin, 
  Eye, ShieldAlert, 
  ShieldCheck, Filter,
  Phone, Mail, Calendar,
  TrendingUp, Users,
  Globe,
  ArrowUpRight,
  UserCheck,
  UserMinus,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/i18n-context'
import { toggleFreezeAction } from '@/app/actions/customers'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface AdminCustomersClientProps {
  initialCustomers: any[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AdminCustomersClient({ initialCustomers }: AdminCustomersClientProps) {
  const { t, language } = useI18n()
  const router = useRouter()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [wilayaFilter, setWilayaFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const customers = initialCustomers

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
      const matchSearch = fullName.includes(search.toLowerCase()) || 
                          (c.phone && c.phone.includes(search)) ||
                          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      
      const matchStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && !c.is_frozen) ||
                          (statusFilter === 'frozen' && c.is_frozen)
      
      const matchWilaya = wilayaFilter === 'all' || c.wilaya === wilayaFilter
      
      return matchSearch && matchStatus && matchWilaya
    })
  }, [customers, search, statusFilter, wilayaFilter])

  const stats = useMemo(() => {
     const active = customers.filter(c => !c.is_frozen).length
     const totalSpent = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0)
     return { active, totalSpent }
  }, [customers])

  const handleToggleFreeze = async (id: string, currentIsFrozen: boolean) => {
    setIsUpdating(id)
    try {
      await toggleFreezeAction(id, !currentIsFrozen)
      router.refresh()
      toast.success(currentIsFrozen ? 'Compte réactivé' : 'Compte suspendu')
    } catch (err: any) {
      toast.error('Erreur: ' + err.message)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleExportToExcel = () => {
    try {
      const exportData = filtered.map(c => ({
        'Nom': c.last_name || '',
        'Prénom': c.first_name || '',
        'Email': c.email || '',
        'Téléphone': c.phone || '',
        'Wilaya': c.wilaya || '',
        'Commune': c.commune || '',
        'Boutique': c.shop_name || '',
        'Commandes': c.order_count || 0,
        'Dépenses (DZD)': c.total_spent || 0,
        'Statut': c.is_frozen ? 'Suspendu' : 'Actif',
        "Date d'inscription": new Date(c.created_at).toLocaleDateString()
      }))
      
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients')
      
      XLSX.writeFile(workbook, `Amouris_Clients_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Fichier Excel généré avec succès')
    } catch (err: any) {
      toast.error('Erreur lors de l\\'export: ' + err.message)
    }
  }

  return (
    <div className="space-y-16 pb-32">
      {/* Premium Gradient Header */}
      <section className="relative p-12 lg:p-16 rounded-[4rem] bg-emerald-950 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-[100px] -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
          <div className="space-y-6">
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.4em] text-white/60 uppercase">Espace Privilège</span>
             </div>
             <div>
                <h1 className="font-serif text-6xl lg:text-7xl text-white font-bold italic tracking-tight mb-4">
                  {t('admin.customers.title')}
                </h1>
                <p className="text-emerald-100/60 font-medium max-w-xl text-lg leading-relaxed">
                  Gérez vos partenaires commerciaux et supervisez l&apos;activité de votre réseau de distribution.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[500px]">
             <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
                      <Users size={24} />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100/40">Total Partenaires</span>
                </div>
                <div className="flex items-end gap-4">
                   <span className="font-serif text-5xl text-white font-bold">{customers.length}</span>
                   <div className="flex flex-col mb-1">
                      <span className="text-emerald-400 text-xs font-bold flex items-center">+{stats.active} actifs</span>
                   </div>
                </div>
             </div>

             <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-[#C9A84C]/30 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                      <TrendingUp size={24} />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100/40">Volume Global</span>
                </div>
                <div className="flex items-end gap-3">
                   <span className="font-serif text-5xl text-white font-bold">{(stats.totalSpent / 1000).toFixed(1)}k</span>
                   <span className="text-emerald-100/40 text-sm font-medium mb-2 uppercase tracking-widest italic">DZD</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Control Center */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="relative flex-1 group">
             <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-all duration-500" />
             <input 
               type="text"
               placeholder={t('admin.customers.search_placeholder')}
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-24 pl-20 pr-10 bg-white border-2 border-emerald-950/5 rounded-[2.5rem] outline-none focus:border-[#C9A84C] shadow-2xl shadow-emerald-900/5 font-medium text-emerald-950 placeholder:text-emerald-950/20 transition-all text-xl"
             />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-24 px-12 rounded-[2.5rem] flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-xl ${showFilters ? 'bg-[#C9A84C] text-white shadow-[#C9A84C]/30' : 'bg-white text-emerald-950 border-2 border-emerald-950/5 hover:border-emerald-950/10'}`}
          >
            <Filter size={20} className={showFilters ? 'rotate-180 transition-transform duration-700' : ''} /> 
            {showFilters ? t('admin.orders.reduce') : t('admin.orders.filters')}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-12 bg-neutral-50 rounded-[3rem] border-2 border-emerald-950/[0.03]">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/40 px-2 block">Statut du Compte</label>
                  <div className="flex gap-3">
                    {['all', 'active', 'frozen'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`flex-1 h-14 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-emerald-950 text-white shadow-lg' : 'bg-white text-emerald-950 border border-emerald-950/5 hover:bg-neutral-100'}`}
                      >
                        {t(`admin.customers.status_${s}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/40 px-2 block">Wilaya de Résidence</label>
                  <select 
                    value={wilayaFilter} 
                    onChange={e => setWilayaFilter(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl bg-white border border-emerald-950/10 text-[11px] font-bold uppercase outline-none focus:border-[#C9A84C] cursor-pointer shadow-sm"
                  >
                    <option value="all">{t('admin.orders.wilaya_all')}</option>
                    {Array.from(new Set(customers.map(c => c.wilaya).filter(Boolean))).map(w => <option key={w} value={w!}>{w}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Table Content */}
      <div className="bg-white rounded-[4rem] border border-emerald-950/5 shadow-2xl shadow-emerald-900/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/30">Partenaire Principal</th>
                <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/30">Détails de Contact</th>
                <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/30">Localisation</th>
                <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/30">Volume d&apos;Affaires</th>
                <th className="px-12 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/30">Action</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-emerald-950/[0.03]"
            >
              {filtered.map((customer) => {
                const isFrozen = customer.is_frozen
                
                return (
                  <motion.tr 
                    variants={item}
                    key={customer.id}
                    className="group hover:bg-neutral-50/50 transition-all duration-500"
                  >
                    <td className="px-12 py-12">
                      <div className="flex items-center gap-10">
                        <div className="relative">
                          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-serif shadow-2xl transition-all duration-700 overflow-hidden ${isFrozen ? 'bg-rose-50 text-rose-300' : 'bg-emerald-50 text-emerald-900 group-hover:scale-110 group-hover:rotate-3'}`}>
                             {customer.images?.[0] && !imageErrors[customer.id] ? (
                               <img 
                                 src={customer.images[0]} 
                                 alt="" 
                                 className="w-full h-full object-cover" 
                                 onError={() => setImageErrors(prev => ({ ...prev, [customer.id]: true }))}
                               />
                             ) : (
                               (customer.first_name || 'C').charAt(0)
                             )}
                          </div>
                          {!isFrozen && (
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-serif text-3xl font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors tracking-tight">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                             <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isFrozen ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                {isFrozen ? 'Partenaire Inactif' : 'Partenaire Actif'}
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-12">
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 text-emerald-950/60 font-medium">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-emerald-950/40">
                               <Phone size={14} />
                            </div>
                            <span className="text-sm">{customer.phone}</span>
                         </div>
                         {customer.email && (
                            <div className="flex items-center gap-3 text-emerald-950/60 font-medium">
                               <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-emerald-950/40">
                                  <Mail size={14} />
                               </div>
                               <span className="text-sm lowercase">{customer.email}</span>
                            </div>
                         )}
                       </div>
                    </td>
                    <td className="px-12 py-12">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 text-emerald-950 font-bold">
                            <MapPin size={14} className="text-[#C9A84C]" />
                            <span className="text-base">{customer.wilaya}</span>
                         </div>
                         <p className="text-[10px] text-emerald-950/30 font-black uppercase tracking-widest pl-5">{customer.commune || 'Centre Ville'}</p>
                      </div>
                    </td>
                    <td className="px-12 py-12">
                       <div className="flex flex-col gap-1">
                          <div className="text-2xl font-serif font-bold text-emerald-950 tracking-tight">
                             {(customer.total_spent || 0).toLocaleString()} 
                             <span className="text-xs font-sans font-normal opacity-30 ml-2 italic">DZD</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A84C]">{customer.order_count || 0} Commandes</span>
                             <div className="h-px w-6 bg-emerald-950/10" />
                          </div>
                       </div>
                    </td>
                    <td className="px-12 py-12 text-right">
                       <div className="flex justify-end gap-4 items-center">
                          <button 
                            onClick={() => handleToggleFreeze(customer.id, !!isFrozen)}
                            disabled={isUpdating === customer.id}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm hover:shadow-xl group/freeze ${isFrozen ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}
                            title={isFrozen ? 'Réactiver le compte' : 'Suspendre le compte'}
                          >
                             {isUpdating === customer.id ? (
                               <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                             ) : isFrozen ? (
                               <UserCheck size={22} className="group-hover/freeze:scale-110" />
                             ) : (
                               <UserMinus size={22} className="group-hover/freeze:scale-110" />
                             )}
                          </button>
                          
                          <Link 
                             href={`/admin/customers/${customer.id}`}
                             className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-[#C9A84C] hover:bg-amber-50/30 transition-all shadow-sm hover:shadow-xl group/btn"
                             title={t('common.view_details')}
                          >
                             <Eye size={22} className="transition-transform group-hover/btn:scale-110" />
                          </Link>
                       </div>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-48 text-center bg-neutral-50/30 relative">
             <div className="w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto mb-10 text-emerald-100 border-4 border-emerald-950/[0.02]">
                <Search size={64} className="opacity-10" />
             </div>
             <p className="font-serif text-5xl text-emerald-950 font-bold italic tracking-tighter mb-4">{t('admin.customers.none_found')}</p>
             <p className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-950/20">
               Ajustez vos critères de recherche
             </p>
          </div>
        )}
      </div>

      {/* Modern Dashboard Footnotes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
         <div className="luxury-card p-12 bg-[#063327] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            <Calendar size={32} className="text-[#C9A84C] mb-8" />
            <h3 className="font-serif text-2xl font-bold mb-4">Système de Gel</h3>
            <p className="text-emerald-100/40 text-sm leading-relaxed mb-6 italic">Un compte gelé ne peut plus passer de commande sur la plateforme B2B.</p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#C9A84C]">
               Sécurité & Gouvernance <ArrowUpRight size={14} />
            </div>
         </div>

         <div className="luxury-card p-12 bg-white group hover:shadow-[#C9A84C]/10 transition-all duration-700">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-[#C9A84C] mb-8 group-hover:scale-110 transition-transform">
               <ShieldCheck size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-emerald-950">Statut Certifié</h3>
            <p className="text-emerald-950/40 text-sm leading-relaxed mb-6 italic">Les indicateurs de volume sont basés sur les commandes livrées uniquement.</p>
            <div className="h-1 w-12 bg-emerald-950/10 group-hover:w-24 transition-all duration-500" />
         </div>

         <div className="luxury-card p-12 bg-white border-emerald-950/10 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-950/5">
               <Globe size={120} />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-emerald-950">Réseau Amouris</h3>
            <p className="text-emerald-950/40 text-sm leading-relaxed mb-8 italic">Votre réseau couvre actuellement 58 wilayas avec une croissance constante.</p>
            <button onClick={handleExportToExcel} className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C] hover:text-emerald-900 transition-colors">
               Exporter la Liste <ArrowUpRight size={14} className="inline ml-2" />
            </button>
         </div>
      </section>
    </div>
  )
}
