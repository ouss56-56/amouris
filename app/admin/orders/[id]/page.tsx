'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useOrdersStore, Order, OrderStatus } from '@/store/orders.store'
import { useSettingsStore } from '@/store/settings.store'
import { 
  ArrowLeft, 
  Printer, 
  Phone, 
  MapPin, 
  Package, 
  CreditCard,
  FileText,
  Save,
  Loader2,
  Calendar,
  User,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import { generateInvoicePDF } from '@/lib/utils/invoice-generator'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  preparing: 'En préparation',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  preparing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-emerald-900 text-white',
  cancelled: 'bg-rose-50 text-rose-700',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { orders, fetchOrders, updateStatus, updatePayment, updateNotes, isLoading } = useOrdersStore()
  const settings = useSettingsStore()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [notes, setNotes] = useState('')
  const [amountPaid, setAmountPaid] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const found = orders.find(o => o.id === id)
    if (found) {
      setOrder(found)
      setNotes(found.admin_notes || '')
      setAmountPaid(found.amount_paid.toString())
    }
  }, [orders, id])

  if (!order) {
    return (
      <div className="py-32 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-emerald-900" size={40} />
        <p className="font-serif text-emerald-950/20 italic">Chargement des détails de la commande...</p>
      </div>
    )
  }

  const handlePrint = () => {
    const doc = generateInvoicePDF(order, settings)
    doc.save(`Facture_${order.order_number}.pdf`)
  }

  const handleSaveNotes = async () => {
    await updateNotes(order.id, notes)
  }

  const handleSavePayment = async () => {
    await updatePayment(order.id, parseFloat(amountPaid) || 0)
  }

  const reste = order.total_amount - order.amount_paid
  const clientName = order.guest_first_name 
    ? `${order.guest_first_name} ${order.guest_last_name}` 
    : 'Client Enregistré'

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
             <h1 className="font-serif text-4xl text-emerald-950 font-black">Commande {order.order_number}</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C] mt-2">Détails de transaction</p>
          </div>
        </div>
        <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="bg-[#0a3d2e] text-white px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              <Printer size={16} /> Imprimer Facture
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items Table */}
          <div className="bg-white rounded-[2.5rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
            <div className="p-8 border-b border-emerald-950/5 flex items-center justify-between">
              <h2 className="text-xl font-serif text-emerald-950 font-bold">Panier de la commande</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">{order.items.length} Articles</span>
            </div>
            <div className="divide-y divide-emerald-950/5">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-neutral-50/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-emerald-950/10">
                       <ShoppingBag size={28} />
                    </div>
                    <div>
                      <p className="font-serif text-xl text-emerald-950">{item.product_name_fr}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C]">
                          {item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units} unités`}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">{item.unit_price.toLocaleString()} DZD / un.</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl text-emerald-950">{item.total_price.toLocaleString()} <span className="text-sm font-normal opacity-40 italic">DZD</span></p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-12 bg-emerald-950 text-white flex justify-between items-center">
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Total à percevoir</p>
                 <h3 className="text-4xl font-serif font-bold italic">{order.total_amount.toLocaleString()} DZD</h3>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Statut Règlement</p>
                 <p className={`text-sm font-black uppercase tracking-widest mt-1 ${order.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {order.payment_status === 'paid' ? 'Soldé' : order.payment_status === 'partial' ? 'Partiel' : 'En attente'}
                 </p>
               </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm space-y-6">
               <div className="flex items-center gap-3 text-emerald-950">
                 <CreditCard size={20} className="text-amber-600" />
                 <h3 className="font-serif text-xl font-bold">Règlement Financial</h3>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 px-1">Encaissé à ce jour</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amountPaid} 
                        onChange={e => setAmountPaid(e.target.value)} 
                        className="w-full h-14 pl-6 pr-16 bg-neutral-50 border border-emerald-950/5 rounded-2xl font-bold text-emerald-950 outline-none focus:border-amber-600 transition-all"
                      />
                      <button 
                        onClick={handleSavePayment}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 bg-emerald-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all flex items-center gap-2"
                      >
                         <Save size={12} /> Appliquer
                      </button>
                    </div>
                  </div>
                  {reste > 0 ? (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">Reste à percevoir :</span>
                       <span className="text-lg font-black text-rose-700">{reste.toLocaleString()} DZD</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
                       <CheckCircle2 size={16} className="text-emerald-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Commande entièrement soldée</span>
                    </div>
                  )}
               </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm space-y-6">
               <div className="flex items-center gap-3 text-emerald-950">
                 <FileText size={20} className="text-emerald-600" />
                 <h3 className="font-serif text-xl font-bold">Notes Internes</h3>
               </div>
               <div className="space-y-4">
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Instructions de livraison, commentaires admin..."
                    rows={4}
                    className="w-full p-5 bg-neutral-50 border border-emerald-950/5 rounded-2xl text-xs font-medium outline-none focus:border-emerald-600 transition-all resize-none"
                  />
                  <button 
                    onClick={handleSaveNotes}
                    className="w-full h-12 bg-white border border-emerald-950/5 text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Sauvegarder Note
                  </button>
               </div>
            </section>
          </div>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-8">
          {/* Order Status */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40">Statut Actuel</h3>
               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[order.order_status]}`}>
                 {STATUS_LABELS[order.order_status]}
               </span>
             </div>
             <div className="space-y-3">
                <label className="text-[9px] font-black text-emerald-950/20 uppercase tracking-widest">Mise à jour du statut</label>
                <div className="grid grid-cols-1 gap-2">
                   {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(status => (
                     <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                        className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${order.order_status === status ? 'bg-emerald-950 text-white shadow-lg' : 'bg-neutral-50 text-emerald-950/40 hover:bg-neutral-100 hover:text-emerald-950'}`}
                     >
                       {STATUS_LABELS[status]}
                     </button>
                   ))}
                </div>
             </div>
          </section>

          {/* Client Details */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm space-y-8">
             <h3 className="font-serif text-xl font-bold text-emerald-950 border-b border-emerald-950/5 pb-4">Profil Client</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-900 border border-amber-100">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Client</p>
                    <p className="text-base font-bold text-emerald-950">{clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900 border border-blue-100">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Téléphone</p>
                    <a href={`tel:${order.guest_phone || ''}`} className="text-base font-bold text-emerald-950 hover:text-blue-600 transition-colors">{order.guest_phone || 'Non fourni'}</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-900 border border-emerald-100">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-950/30 uppercase tracking-widest">Wilaya</p>
                    <p className="text-base font-bold text-emerald-950">{order.guest_wilaya || 'Non fournie'}</p>
                  </div>
                </div>
             </div>
             
             {order.customer_id && (
               <Link 
                 href={`/admin/customers/${order.customer_id}`}
                 className="mt-8 block text-center py-4 rounded-xl bg-neutral-50 text-[10px] font-black uppercase tracking-widest text-emerald-950/40 hover:bg-emerald-900 hover:text-white transition-all flex items-center justify-center gap-2"
               >
                 Voir historique client <ArrowLeft size={12} className="rotate-180" />
               </Link>
             )}
          </section>

          {/* Timeline Info */}
          <section className="bg-neutral-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                <Calendar size={160} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Chronologie</p>
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4">
                   <div className="w-0.5 bg-amber-500/30 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white">Commande créée</p>
                      <p className="text-[10px] text-white/40 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-0.5 bg-amber-500/30 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white">Dernière modification</p>
                      <p className="text-[10px] text-white/40 mt-1">{new Date(order.updated_at).toLocaleString()}</p>
                   </div>
                </div>
              </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
