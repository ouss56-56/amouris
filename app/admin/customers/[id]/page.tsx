'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore, Profile } from '@/store/customers.store'
import { useOrdersStore } from '@/store/orders.store'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  ShieldAlert, 
  ShieldCheck,
  Calendar,
  Eye,
  Store,
  CreditCard,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { customers, fetchCustomers, toggleFreeze } = useCustomersStore()
  const { orders, fetchOrders } = useOrdersStore()
  
  const [customer, setCustomer] = useState<Profile | null>(null)

  useEffect(() => {
    fetchCustomers()
    fetchOrders()
  }, [fetchCustomers, fetchOrders])

  useEffect(() => {
    const found = customers.find(c => c.id === id)
    if (found) setCustomer(found)
  }, [customers, id])

  const customerOrders = useMemo(() => orders.filter(o => o.customer_id === id), [orders, id])
  const totalSpent = useMemo(() => customerOrders.reduce((s, o) => s + o.total_amount, 0), [customerOrders])

  if (!customer) {
    return (
      <div className="py-32 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-emerald-900" size={40} />
        <p className="font-serif text-emerald-950/20 italic">Identification du partenaire...</p>
      </div>
    )
  }

  const isFrozen = customer.status === 'frozen'

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-14 h-14 bg-white border border-emerald-950/5 rounded-2xl flex items-center justify-center text-emerald-950 shadow-sm hover:bg-neutral-50 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
             <h1 className="font-serif text-4xl text-emerald-950 font-black">{customer.first_name} {customer.last_name}</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C] mt-2">Dossier Partenaire B2B</p>
          </div>
        </div>
        <button 
          onClick={() => toggleFreeze(customer.id)}
          className={`px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${isFrozen ? 'bg-emerald-600 text-white shadow-emerald-900/10' : 'bg-rose-500 text-white shadow-rose-900/10'}`}
        >
          {isFrozen ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
          {isFrozen ? 'Lever la suspension' : 'Geler le compte'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Profile Info */}
        <aside className="space-y-8">
          <section className="bg-white p-8 rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 space-y-8 relative overflow-hidden">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-50" />
             
             <div className="flex flex-col items-center text-center pb-8 border-b border-emerald-950/5">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-3xl font-serif mb-4 shadow-inner ${isFrozen ? 'bg-rose-50 text-rose-300' : 'bg-amber-100 text-amber-700'}`}>
                  {customer.first_name.charAt(0)}
                </div>
                <h2 className="font-serif text-2xl text-emerald-950 font-bold">{customer.first_name} {customer.last_name}</h2>
                <div className="mt-2 px-4 py-1.5 bg-neutral-50 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-950/30">ID: {customer.id.slice(0, 12)}...</div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Téléphone</p>
                    <a href={`tel:${customer.phone_number}`} className="text-sm font-bold text-emerald-950 hover:text-emerald-700 transition-colors">{customer.phone_number}</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-bold text-emerald-950">{customer.email || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Magasin</p>
                    <p className="text-sm font-bold text-emerald-950 italic">{customer.shop_name || 'Sans enseigne'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-emerald-700">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Localisation</p>
                    <p className="text-sm font-bold text-emerald-950">{customer.wilaya}, {customer.commune || 'Centre'}</p>
                  </div>
                </div>
             </div>
          </section>

          {/* Stats Bar */}
          <section className="bg-emerald-950 rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl shadow-emerald-900/20">
             <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <ShoppingBag size={32} className="text-amber-500" />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Volume Commandes</p>
                   <p className="text-3xl font-serif font-bold italic">{customerOrders.length}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <CreditCard size={32} className="text-emerald-400" />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total des achats</p>
                   <p className="text-3xl font-serif font-bold italic">{totalSpent.toLocaleString()} <span className="text-sm font-normal opacity-40">DZD</span></p>
                </div>
             </div>
          </section>
        </aside>

        {/* Main Content: Order History */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
              <div className="p-8 border-b border-emerald-950/5 flex items-center justify-between">
                 <h2 className="text-xl font-serif text-emerald-950 font-bold">Historique des transactions</h2>
                 <Calendar size={20} className="text-emerald-950/10" />
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50">
                       <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-emerald-950/20">Commande</th>
                       <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-emerald-950/20">Date</th>
                       <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-emerald-950/20">Montant</th>
                       <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-emerald-950/20">Status</th>
                       <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-widest text-emerald-950/20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/5">
                    {customerOrders.length > 0 ? customerOrders.map((order) => (
                      <tr key={order.id} className="group hover:bg-neutral-50/20 transition-all font-sans">
                        <td className="px-8 py-6 font-bold text-emerald-950">{order.order_number}</td>
                        <td className="px-8 py-6 text-xs text-emerald-950/40">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-8 py-6 font-serif text-base font-bold text-emerald-950">{order.total_amount.toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-neutral-100 text-neutral-400`}>
                             {order.order_status.toUpperCase()}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <Link href={`/admin/orders/${order.id}`} className="p-2 text-emerald-950/20 hover:text-emerald-950 transition-colors inline-block">
                              <Eye size={18} />
                           </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-emerald-950/10 italic font-serif text-xl border-dashed">
                           Aucune commande enregistrée à ce jour.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>

           {/* internal note or something */}
           <section className="bg-neutral-50 rounded-[3rem] p-12 border border-emerald-950/5">
              <h3 className="font-serif text-2xl text-emerald-950 mb-6">Profil de fidélité</h3>
              <p className="text-xs text-emerald-950/40 leading-relaxed max-w-xl">
                 Ce partenaire est enregistré depuis le {new Date(customer.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}. 
                 Toutes les transactions sont soumises à la validation administrative avant expédition.
              </p>
           </section>
        </div>
      </div>
    </div>
  )
}
