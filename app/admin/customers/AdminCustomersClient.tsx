'use client'

import { useState, useMemo } from 'react'
import { 
  Search, User, MapPin, 
  Eye, ShieldAlert, 
  ShieldCheck, Filter,
  Phone, Mail, Calendar,
  TrendingUp, Users,
  Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/i18n-context'
import { freezeCustomer as apiFreezeCustomer } from '@/lib/api/customers'
import { toast } from 'sonner'

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

  const customers = initialCustomers

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
      const matchSearch = fullName.includes(search.toLowerCase()) || 
                          c.phone_number.includes(search) ||
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
    try {
      await apiFreezeCustomer(id, !currentIsFrozen)
      router.refresh()
      toast.success(currentIsFrozen ? 'Compte réactivé' : 'Compte suspendu')
    } catch (err: any) {
      toast.error('Erreur: ' + err.message)
    }
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Stats Section */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
           <h1 className="font-serif text-6xl text-emerald-950 font-bold italic tracking-tight">
             {t('admin.customers.title')}
           </h1>
           <div className="flex items-center gap-4">
             <div className="h-px w-12 bg-[#C9A84C]/40" />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">
               {t('admin.customers.subtitle')}
             </p>
           </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
           <div className="luxury-card p-6 min-w-[180px] bg-neutral-50/50">
              <div className="flex items-center gap-3 mb-3 text-emerald-900/30">
                 <Users size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-none">Total Partenaires</span>
              </div>
              <div className="font-serif text-3xl text-emerald-950 font-bold">{customers.length}</div>
           </div>
           <div className="luxury-card p-6 min-w-[180px] bg-emerald-50/30 border-emerald-100">
              <div className="flex items-center gap-3 mb-3 text-emerald-700/40">
                 <TrendingUp size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-none">Volume d&apos;Affaires</span>
              </div>
              <div className="font-serif text-3xl text-emerald-900 font-bold">{stats.totalSpent.toLocaleString()} <span className="text-xs font-sans font-normal opacity-50">DZD</span></div>
           </div>
        </div>
      </header>

      {/* Control Bar */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1 group">
             <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-900/10 group-focus-within:text-[#C9A84C] transition-all duration-300" />
             <input 
               type="text"
               placeholder={t('admin.customers.search_placeholder')}
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-20 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-900/5 focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 placeholder:text-emerald-950/20 transition-all font-sans text-lg"
             />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-20 px-10 rounded-3xl border flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm ${showFilters ? 'bg-emerald-950 border-emerald-950 text-white shadow-emerald-900/20 px-12' : 'bg-white border-emerald-950/5 text-emerald-950/40 hover:text-emerald-950 hover:bg-neutral-50'}`}
          >
            <Filter size={18} className={showFilters ? 'animate-pulse' : ''} /> 
            {showFilters ? t('admin.orders.reduce') : t('admin.orders.filters')}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-neutral-100/60 backdrop-blur-xl rounded-[2.5rem] border border-emerald-950/5 shadow-inner"
            >
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/40 px-2">
                   <ShieldCheck size={12} /> {t('admin.customers.filter_status')}
                </label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-16 px-6 rounded-2xl bg-white border border-emerald-950/10 text-[11px] font-bold uppercase outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 transition-all cursor-pointer">
                  <option value="all">{t('admin.customers.status_all')}</option>
                  <option value="active">{t('admin.customers.status_active')}</option>
                  <option value="frozen">{t('admin.customers.status_frozen')}</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/40 px-2">
                   <Globe size={12} /> {t('admin.customers.filter_wilaya')}
                </label>
                <select value={wilayaFilter} onChange={e => setWilayaFilter(e.target.value)} className="w-full h-16 px-6 rounded-2xl bg-white border border-emerald-950/10 text-[11px] font-bold uppercase outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 transition-all cursor-pointer">
                  <option value="all">{t('admin.orders.wilaya_all')}</option>
                  {Array.from(new Set(customers.map(c => c.wilaya).filter(Boolean))).map(w => <option key={w} value={w!}>{w}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Table Content */}
      <div className="luxury-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="luxury-table-header">{t('admin.customers.table.partner')}</th>
                <th className="luxury-table-header">{t('admin.customers.table.location')}</th>
                <th className="luxury-table-header">{t('admin.customers.table.volume')}</th>
                <th className="luxury-table-header">{t('admin.customers.table.status')}</th>
                <th className="luxury-table-header text-right rtl:text-left">{t('admin.customers.table.controls')}</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-emerald-950/5"
            >
              {filtered.map((customer) => {
                const isFrozen = customer.is_frozen
                
                return (
                  <motion.tr 
                    variants={item}
                    key={customer.id}
                    className="group hover:bg-neutral-50/30 transition-all duration-300 font-sans"
                  >
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl font-serif shadow-2xl transition-all duration-500 overflow-hidden ${isFrozen ? 'bg-rose-50 text-rose-300 scale-95' : 'bg-emerald-50 text-emerald-900 group-hover:scale-105 group-hover:shadow-emerald-900/10'}`}>
                             {customer.images?.[0] ? (
                               <img src={customer.images[0]} alt="" className="w-full h-full object-cover" />
                             ) : (
                               (customer.first_name || 'C').charAt(0)
                             )}
                          </div>
                          {!isFrozen && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-serif text-2xl font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors tracking-tight">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-emerald-950/60 font-black uppercase tracking-[0.2em]">
                             <span className="flex items-center gap-1.5"><Phone size={10} className="text-[#C9A84C]" /> {customer.phone_number}</span>
                             {customer.email && (
                               <span className="flex items-center gap-1.5"><Mail size={10} /> {customer.email}</span>
                             )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-emerald-900/20 group-hover:bg-amber-50 group-hover:text-[#C9A84C] transition-all">
                            <MapPin size={16} />
                         </div>
                         <div className="space-y-1">
                           <p className="text-sm font-bold text-emerald-950">{customer.wilaya}</p>
                           <p className="text-[10px] text-emerald-950/60 font-black uppercase tracking-[0.2em]">{customer.commune || t('common.center')}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-center md:text-left">
                       <div className="inline-flex flex-col gap-1.5 p-4 rounded-2xl bg-neutral-50/50 group-hover:bg-white transition-colors border border-transparent group-hover:border-emerald-950/5">
                           <div className="flex items-center gap-2 font-serif text-lg font-bold text-emerald-950">
                              {customer.order_count || 0} 
                              <span className="text-[10px] font-sans font-black uppercase tracking-widest opacity-40 italic">Commandes</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] font-black text-emerald-700/80 uppercase tracking-widest">
                              <TrendingUp size={10} className="text-emerald-500" />
                              {(customer.total_spent || 0).toLocaleString()} <span className="text-[8px] opacity-40">DZD</span>
                           </div>
                       </div>
                    </td>
                    <td className="px-10 py-10">
                      <button 
                        onClick={() => handleToggleFreeze(customer.id, !!isFrozen)}
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:shadow-md ${isFrozen ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'}`}
                      >
                         {isFrozen ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                         {isFrozen ? t('admin.customers.status_frozen_label') : t('admin.customers.status_active_label')}
                      </button>
                    </td>
                    <td className="px-10 py-10 text-right rtl:text-left">
                       <div className="flex justify-end rtl:justify-start gap-3 items-center">
                          <Link 
                             href={`/admin/customers/${customer.id}`}
                             className="w-14 h-14 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/30 hover:text-emerald-950 hover:border-[#C9A84C] hover:bg-amber-50/30 transition-all shadow-sm hover:shadow-lg group/btn"
                             title={t('common.view_details')}
                          >
                             <Eye size={20} className="transition-transform group-hover/btn:scale-110" />
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
          <div className="py-40 text-center bg-neutral-50/20">
             <div className="w-28 h-28 bg-neutral-50 rounded-[3rem] shadow-inner flex items-center justify-center mx-auto mb-8 text-emerald-100 border border-emerald-950/5">
                <Search size={44} className="opacity-40" />
             </div>
             <p className="font-serif text-4xl text-emerald-950/10 italic tracking-tight">{t('admin.customers.none_found')}</p>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/20 mt-4 leading-relaxed">
               Affinez vos filtres ou tentez une autre recherche
             </p>
          </div>
        )}
      </div>

      {/* Quick Access Grid (Optional enhancement) */}
      {!search && filtered.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="luxury-card p-10 bg-[#0a3d2e] text-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
              <Calendar size={24} className="text-[#C9A84C] mb-6" />
              <h3 className="font-serif text-xl font-bold mb-2">Activités Récentes</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Mise à jour en temps réel</p>
           </div>
           <div className="luxury-card p-10 bg-white group hover:bg-[#C9A84C]/5 transition-colors border-emerald-950/5">
              <Phone size={24} className="text-[#C9A84C] mb-6" />
              <h3 className="font-serif text-xl font-bold mb-2 text-emerald-950">Support Partenaires</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/40 italic">Accès direct CRM</p>
           </div>
        </section>
      )}
    </div>
  )
}

