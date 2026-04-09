'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  Save, 
  User, 
  UserCheck, 
  Phone, 
  MapPin, 
  Package, 
  CreditCard, 
  History,
  XCircle,
  Clock,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useOrdersStore, OrderStatus, PaymentStatus } from '@/store/orders.store'
import { useI18n } from '@/i18n/i18n-context'
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/status-helpers'
import { generateInvoicePDF } from '@/lib/generate-invoice'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered']

interface AdminOrderDetailClientProps {
  orderId: string
}

export default function AdminOrderDetailClient({ orderId }: AdminOrderDetailClientProps) {
  const { t, language } = useI18n()
  const { orders, updateStatus, updatePayment, generateInvoice } = useOrdersStore()
  
  const order = orders.find(o => o.id === orderId)
  const isAr = language === 'ar'

  const [isGenerating, setIsGenerating] = useState(false)

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-emerald-950/20">
        <Package size={64} />
        <p className="font-serif text-xl italic">{t('admin.orders.detail.not_found') || 'Commande introuvable'}</p>
        <Link href="/admin/orders">
           <button className="text-emerald-900 font-bold underline uppercase tracking-widest text-[10px]">Retour à la liste</button>
        </Link>
      </div>
    )
  }

  const currentStatusIndex = order.order_status === 'cancelled' ? -1 : STATUSES.indexOf(order.order_status)
  const remaining = order.total_amount - (order.amount_paid || 0)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      updateStatus(order.id, newStatus)
      toast.success(`${t('admin.orders.detail.status_updated')} : ${getOrderStatusLabel(newStatus, language)}`)
    } catch (e) {
      toast.error(t('admin.orders.detail.error_status_update'))
    }
  }

  const handlePaymentUpdate = async (type: 'paid' | 'unpaid' | 'partial') => {
    try {
      let amount = 0
      if (type === 'paid') amount = order.total_amount
      if (type === 'partial') {
        const val = prompt('Montant payé (DZD):', order.amount_paid.toString())
        if (val === null) return
        amount = parseFloat(val)
      }
      
      updatePayment(order.id, amount)
      toast.success(t('admin.orders.detail.payment_updated'))
    } catch (e) {
      toast.error(t('admin.orders.detail.error_payment_update'))
    }
  }

  const handleInvoiceGen = async () => {
    try {
      setIsGenerating(true)
      generateInvoice(order.id)
      toast.success(t('admin.orders.detail.invoice_generated'))
    } catch (error: any) {
      toast.error('Erreur: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="p-3 bg-white border border-emerald-950/5 hover:bg-emerald-50 rounded-2xl transition-colors text-emerald-900 shadow-sm">
              <ArrowLeft size={20} className="rtl:rotate-180" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-bold font-serif text-emerald-950">Commande {order.order_number}</h1>
               {order.is_registered_customer ? (
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                   <UserCheck size={10} /> Client Enregistré
                 </span>
               ) : (
                 <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                   <User size={10} /> Commande Invité
                 </span>
               )}
            </div>
            <p className="text-emerald-950/40 text-xs">{new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {order.invoice_generated && order.invoice_data && (
            <button 
              onClick={() => generateInvoicePDF(order.invoice_data!)}
              className="h-12 px-6 bg-white border border-emerald-950/10 text-emerald-950 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-sm"
            >
              <Download size={14} /> Facture PDF
            </button>
          )}
          <button 
            onClick={handleInvoiceGen}
            disabled={isGenerating}
            className="h-12 px-6 bg-emerald-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#C9A84C] transition-all shadow-xl shadow-emerald-950/10 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {order.invoice_generated ? 'Régénérer' : 'Générer Facture'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Tracking & Items */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tracking Timeline */}
          <section className="bg-white p-10 rounded-[2.5rem] border border-emerald-950/5 shadow-sm">
            <h2 className="text-xl font-bold font-serif text-emerald-950 mb-10 flex items-center gap-3">
              <Clock size={20} className="text-emerald-600" />
              Suivi de la commande
            </h2>
            
            {order.order_status === 'cancelled' ? (
              <div className="p-10 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-bold text-center space-y-2">
                 <XCircle size={40} className="mx-auto mb-2" />
                 <p className="text-lg">Commande Annulée</p>
                 <button 
                   onClick={() => handleStatusChange('pending')}
                   className="text-[10px] uppercase tracking-widest font-black underline opacity-60 hover:opacity-100"
                 >
                   Rétablir en attente
                 </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-50 rounded-full" />
                <div 
                  className="absolute top-5 left-0 h-1 bg-emerald-500 transition-all duration-700 rounded-full" 
                  style={{ width: `${(Math.max(0, currentStatusIndex) / (STATUSES.length - 1)) * 100}%` }}
                />
                
                <div className="relative z-10 flex justify-between">
                  {STATUSES.map((status, idx) => {
                    const isCompleted = idx <= currentStatusIndex
                    const isCurrent = idx === currentStatusIndex
                    return (
                      <div 
                        key={status} 
                        className="flex flex-col items-center gap-4 cursor-pointer group flex-1"
                        onClick={() => handleStatusChange(status)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all relative
                          ${isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-neutral-50 text-neutral-200'}
                          ${isCurrent ? 'scale-110 shadow-lg shadow-emerald-500/20' : ''}
                        `}>
                          {isCompleted ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                          {isCurrent && <span className="absolute -inset-2 border-2 border-emerald-500/20 rounded-full animate-ping" />}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest text-center transition-colors
                          ${isCurrent ? 'text-emerald-950' : isCompleted ? 'text-emerald-950/60' : 'text-neutral-200'}
                        `}>
                          {getOrderStatusLabel(status, language)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {order.order_status !== 'cancelled' && (
               <div className="mt-12 pt-8 border-t border-emerald-950/5 flex justify-end">
                  <button 
                    onClick={() => handleStatusChange('cancelled')}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle size={14} /> Annuler la commande
                  </button>
               </div>
            )}
          </section>

          {/* Items Table */}
          <section className="bg-white rounded-[2.5rem] border border-emerald-950/5 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-emerald-950/5 flex items-center justify-between">
                <h2 className="text-xl font-bold font-serif text-emerald-950 flex items-center gap-3">
                  <Package size={20} className="text-emerald-600" />
                  Articles commandés
                </h2>
                <span className="px-3 py-1 bg-neutral-100 rounded-lg text-[10px] font-black text-neutral-400">
                  {order.items.length} ITEMS
                </span>
             </div>
             <table className="w-full text-left">
                <thead className="bg-neutral-50/50 text-[10px] font-black uppercase tracking-widest text-emerald-950/30">
                   <tr>
                      <th className="px-8 py-5">Désignation</th>
                      <th className="px-8 py-5">Quantité</th>
                      <th className="px-8 py-5">Prix Unitaire</th>
                      <th className="px-8 py-5 text-right">Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/5">
                   {order.items.map((item, idx) => (
                     <tr key={idx} className="hover:bg-neutral-50/30 transition-colors">
                        <td className="px-8 py-6">
                           <div className="font-bold text-emerald-950">{isAr ? item.product_name_ar : item.product_name_fr}</div>
                           <div className="text-[10px] font-medium text-emerald-950/40 uppercase tracking-widest mt-0.5">
                              {item.variant_label || (item.product_type === 'perfume' ? 'Vrac' : 'Standard')}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                             {item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units}x`}
                           </span>
                        </td>
                        <td className="px-8 py-6 font-medium text-sm text-emerald-950/60">
                           {item.unit_price.toLocaleString()} DZD
                        </td>
                        <td className="px-8 py-6 text-right font-black text-emerald-950">
                           {item.total_price.toLocaleString()} DZD
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             <div className="p-8 bg-neutral-50/50 flex justify-end items-center gap-12 border-t border-emerald-950/5">
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/30 mb-1">TOTAL COMMANDE</p>
                   <p className="text-3xl font-serif text-emerald-950 font-bold">{order.total_amount.toLocaleString()} <span className="text-xs font-sans font-medium text-emerald-950/40">DZD</span></p>
                </div>
             </div>
          </section>
        </div>

        {/* Right Column: Client & Payment */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Client Profile Card */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm">
             <h2 className="text-lg font-bold font-serif text-emerald-950 mb-8 border-b border-emerald-950/5 pb-4">Profil Client</h2>
             
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <User size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/30 mb-0.5">Nom Complet</p>
                      <p className="font-bold text-emerald-950">
                        {order.is_registered_customer ? 'Client Enregistré' : `${order.guest_first_name} ${order.guest_last_name}`}
                      </p>
                      {order.is_registered_customer && (
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">ID: {order.customer_id?.slice(0, 8)}</p>
                      )}
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/30 mb-0.5">Contact</p>
                      <p className="font-bold text-emerald-950">{order.guest_phone || 'Voir profil client'}</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/30 mb-0.5">Destination</p>
                      <p className="font-bold text-emerald-950 lowercase first-letter:uppercase">
                        {order.guest_wilaya || 'Voir profil'} {order.guest_commune ? `- ${order.guest_commune}` : ''}
                      </p>
                   </div>
                </div>
             </div>

             {order.is_registered_customer && (
               <Link href={`/admin/customers/${order.customer_id}`} className="block mt-8">
                  <button className="w-full py-3 bg-neutral-50 text-emerald-950/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-950 transition-colors">
                     Voir le profil complet
                  </button>
               </Link>
             )}
          </section>

          {/* Payment Card */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm">
             <h2 className="text-lg font-bold font-serif text-emerald-950 mb-8 border-b border-emerald-950/5 pb-4">Transaction</h2>
             
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between items-end mb-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/30">Statut du paiement</p>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {getPaymentStatusLabel(order.payment_status, language)}
                      </span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handlePaymentUpdate('paid')}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          order.payment_status === 'paid' ? 'bg-emerald-950 text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                         Payé 100%
                      </button>
                      <button 
                         onClick={() => handlePaymentUpdate('partial')}
                         className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                           order.payment_status === 'partial' ? 'bg-[#C9A84C] text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-amber-50 hover:text-[#C9A84C]'
                         }`}
                      >
                         Acompte
                      </button>
                   </div>
                   <button 
                      onClick={() => handlePaymentUpdate('unpaid')}
                      className="w-full mt-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-neutral-50 text-neutral-300 hover:bg-rose-50 hover:text-rose-500 transition-all font-bold"
                   >
                      Réinitialiser à 0 DZD
                   </button>
                </div>

                <div className="p-6 bg-neutral-50 rounded-3xl space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-950/40 font-medium">Déjà versé</span>
                      <span className="font-bold text-emerald-600">{order.amount_paid.toLocaleString()} DZD</span>
                   </div>
                   <div className="flex justify-between items-center text-xs pt-4 border-t border-emerald-950/5">
                      <span className="text-emerald-950 font-bold uppercase tracking-widest text-[10px]">Reste à percevoir</span>
                      <span className={`font-black text-lg ${remaining > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {remaining.toLocaleString()} DZD
                      </span>
                   </div>
                </div>
             </div>
          </section>

          {/* Status History (Minified) */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm">
             <h2 className="text-lg font-bold font-serif text-emerald-950 mb-6 flex items-center gap-2">
                <History size={18} className="text-emerald-600" />
                Historique
             </h2>
             <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                {order.status_history?.slice().reverse().map((entry, i) => (
                  <div key={i} className="flex gap-4 relative pb-4 border-l-2 border-emerald-50 ml-2 pl-6">
                     <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-emerald-200" />
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/80 mb-0.5">
                          {getOrderStatusLabel(entry.status, language)}
                        </p>
                        <p className="text-[9px] text-emerald-950/30">
                          {new Date(entry.changed_at).toLocaleString()}
                        </p>
                     </div>
                  </div>
                ))}
             </div>
          </section>

        </div>
      </div>
    </div>
  )
}
