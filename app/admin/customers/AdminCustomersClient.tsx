'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCustomersStore } from '@/store/customers.store'
import { useOrdersStore } from '@/store/orders.store'
import { 
  Search, User, Phone, MapPin, 
  ShoppingBag, Eye, ShieldAlert, 
  ShieldCheck, Filter, Loader2,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function AdminCustomersClient() {
  const { customers, fetchCustomers, toggleFreeze } = useCustomersStore()
  const { orders, fetchOrders } = useOrdersStore()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [wilayaFilter, setWilayaFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCustomers()
    fetchOrders()
  }, [fetchCustomers, fetchOrders])

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
      const matchSearch = fullName.includes(search.toLowerCase()) || 
                          c.phone_number.includes(search) ||
                          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      
      const matchStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && c.status === 'active') ||
                          (statusFilter === 'frozen' && c.status === 'frozen')
      
      const matchWilaya = wilayaFilter === 'all' || c.wilaya === wilayaFilter
      
      return matchSearch && matchStatus && matchWilaya
    })
  }, [customers, search, statusFilter, wilayaFilter])

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bolditalic">Cercle Privé</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Gestion du portefeuille partenaires B2B</p>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
             <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
             <input 
               type="text"
               placeholder="Rechercher un client (Nom, Tel, Email)..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
             />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-16 px-8 rounded-2xl border flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-emerald-950/5 text-emerald-950/40 hover:text-emerald-950'}`}
          >
            <Filter size={16} /> {showFilters ? 'Réduire' : 'Filtres'}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-neutral-100 rounded-3xl"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-emerald-950/30 px-1">État de Compte</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white border border-emerald-950/5 text-[10px] font-bold uppercase outline-none">
                  <option value="all">Tous les accès</option>
                  <option value="active">Actifs uniquement</option>
                  <option value="frozen">Suspendus</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-emerald-950/30 px-1">Région (Wilaya)</label>
                <select value={wilayaFilter} onChange={e => setWilayaFilter(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white border border-emerald-950/5 text-[10px] font-bold uppercase outline-none">
                  <option value="all">Toutes les wilayas</option>
                  {Array.from(new Set(customers.map(c => c.wilaya).filter(Boolean))).map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Partenaire</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Localisation</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30 text-center">Volume Affaires</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Statut</th>
                <th className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Contrôles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((customer) => {
                  const customerOrders = orders.filter(o => o.customer_id === customer.id)
                  const totalSpent = customerOrders.reduce((s, o) => s + o.total_amount, 0)
                  const isFrozen = customer.status === 'frozen'
                  
                  return (
                    <motion.tr 
                      layout
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-neutral-50/20 transition-all font-sans"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-serif shadow-sm transition-all ${isFrozen ? 'bg-rose-50 text-rose-300' : 'bg-amber-100 text-amber-700'}`}>
                             {(customer.first_name || 'C').charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-bold text-emerald-950">{customer.first_name} {customer.last_name}</p>
                            <p className="text-[10px] text-emerald-950/30 font-black uppercase tracking-widest mt-0.5">{customer.phone_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-emerald-900/20" />
                           <div>
                             <p className="text-sm font-bold text-emerald-950">{customer.wilaya}</p>
                             <p className="text-[10px] text-emerald-950/30 font-medium uppercase tracking-widest">{customer.commune || 'Centre'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="text-center">
                            <div className="font-serif text-lg font-bold text-emerald-950">{customerOrders.length} <span className="text-[10px] font-normal opacity-30 italic">Cmd</span></div>
                            <div className="text-[10px] text-emerald-700 font-black uppercase tracking-widest mt-1">{totalSpent.toLocaleString()} DZD</div>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                        <button 
                          onClick={() => toggleFreeze(customer.id)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isFrozen ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}
                        >
                           {isFrozen ? <ShieldAlert size={12} className="inline mr-2" /> : <ShieldCheck size={12} className="inline mr-2" />}
                           {isFrozen ? 'Gelé' : 'Actif'}
                        </button>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <div className="flex justify-end gap-3 h-full items-center">
                            <Link 
                              href={`/admin/customers/${customer.id}`}
                              className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm"
                            >
                               <Eye size={18} />
                            </Link>
                         </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center bg-neutral-50/20">
             <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-emerald-100 border border-emerald-950/5">
                <User size={40} />
             </div>
             <p className="font-serif text-3xl text-emerald-950/10 italic">Aucun partenaire trouvé.</p>
          </div>
        )}
      </div>
    </div>
  )
}
