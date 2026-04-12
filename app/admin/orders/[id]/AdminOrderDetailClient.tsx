'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  User, 
  UserCheck, 
  Phone, 
  MapPin, 
  Package, 
  History,
  XCircle,
  Clock,
  Download,
  Banknote
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { 
  updateOrderStatus as apiUpdateOrderStatus, 
  updateOrderPayment as apiUpdateOrderPayment,
  generateInvoice as apiGenerateInvoice
} from '@/lib/api/orders'
import { StoreSettings } from '@/store/settings.store'
import { OrderStatus } from '@/store/orders.store'
import { useI18n } from '@/i18n/i18n-context'
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/status-helpers'
import { generateInvoicePDF } from '@/lib/utils/invoice-generator'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered']

interface AdminOrderDetailClientProps {
  initialOrder: any
  settings: StoreSettings
}

export default function AdminOrderDetailClient({ initialOrder, settings }: AdminOrderDetailClientProps) {
  const router = useRouter()
  const { t, language } = useI18n()
  
  const order = initialOrder
  const isAr = language === 'ar'

  const [isGenerating, setIsGenerating] = useState(false)

  const currentStatusIndex = order.order_status === 'cancelled' ? -1 : STATUSES.indexOf(order.order_status as OrderStatus)
  const remaining = order.total_amount - (order.amount_paid || 0)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await apiUpdateOrderStatus(order.id, newStatus)
      router.refresh()
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
        const val = prompt(`${t('admin.orders.table.amount_payment')} (DZD):`, order.amount_paid.toString())
        if (val === null) return
        amount = parseFloat(val)
      }
      
      await apiUpdateOrderPayment(order.id, amount)
      router.refresh()
      toast.success(t('admin.orders.detail.payment_updated'))
    } catch (e) {
      toast.error(t('admin.orders.detail.error_payment_update'))
    }
  }

  const handleInvoiceGen = async () => {
    try {
      setIsGenerating(true)
      
      const invoiceData = {
        order_number: order.order_number,
        order_date: new Date(order.created_at).toLocaleDateString(),
        generated_at: new Date().toISOString(),
        shop_name: settings.storeNameFR,
        shop_address: settings.address,
        shop_phone: settings.phone,
        shop_email: settings.email,
        client_name: order.guest_first_name ? `${order.guest_first_name} ${order.guest_last_name}` : 'Client',
        client_phone: order.guest_phone || 'N/A',
        client_wilaya: order.guest_wilaya || 'N/A',
        client_commune: order.guest_commune || '',
        payment_status: order.payment_status,
        amount_paid: order.amount_paid,
        total: order.total_amount,
        subtotal: order.total_amount,
        remaining: order.total_amount - order.amount_paid,
        items: order.items.map((item: any) => ({
          description: isAr ? item.product_name_ar : item.product_name_fr,
          quantity: item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units}u`,
          unit_price: item.unit_price,
          total: item.total_price
        }))
      }

      await apiGenerateInvoice(order.id, invoiceData)
      router.refresh()
      toast.success(t('admin.orders.detail.invoice_generated'))
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    const toastId = toast.loading(t('admin.orders.detail.invoice_generating') || 'Génération de la facture...')
    try {
      const doc = await generateInvoicePDF(order, settings)
      const filename = language === 'ar' ? `فاتورة_${order.order_number}.pdf` : `Facture_${order.order_number}.pdf`
      doc.save(filename)
      toast.success(t('admin.orders.detail.invoice_ready') || 'Facture prête', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error('Erreur: ' + err.message, { id: toastId })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="p-3 bg-white border border-emerald-950/5 hover:bg-emerald-50 rounded-2xl transition-colors text-emerald-900 shadow-sm">
              <ArrowLeft size={20} className="rtl:rotate-180" />
            </button>
          </Link>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-4xl font-bold font-serif text-emerald-950">{t('admin.orders.id_label')} {order.order_number}</h1>
               {order.is_registered_customer ? (
                 <span className="px-4 py-1.5 bg-emerald-100/50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-emerald-200/50">
                   <UserCheck size={12} /> {t('admin.orders.customer_registered')}
                 </span>
               ) : (
                 <span className="px-4 py-1.5 bg-neutral-100 text-neutral-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-neutral-200/50">
                   <User size={12} /> {t('admin.orders.customer_guest')}
                 </span>
               )}
            </div>
            <p className="text-emerald-950/60 font-semibold text-sm tracking-wide">{new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</p>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          {order.invoice_generated && (
            <button 
              onClick={handleDownload}
              className="h-12 px-6 bg-white border border-emerald-950/10 text-emerald-950 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-sm"
            >
              <Download size={14} /> {t('admin.orders.print_invoice')}
            </button>
          )}
          <button 
            onClick={handleInvoiceGen}
            disabled={isGenerating}
            className="h-12 px-6 bg-emerald-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#C9A84C] transition-all shadow-xl shadow-emerald-950/10 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {order.invoice_generated ? t('admin.orders.regenerate_invoice') : t('admin.orders.generate_invoice')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="luxury-card p-10">
            <h2 className="text-2xl font-bold font-serif text-emerald-950 mb-12 flex items-center gap-3">
              <Clock size={24} className="text-[#C9A84C]" />
              {t('admin.orders.tracking_title')}
            </h2>
            
            {order.order_status === 'cancelled' ? (
              <div className="p-12 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-rose-600 font-bold text-center space-y-4 shadow-inner">
                 <XCircle size={48} className="mx-auto mb-2 opacity-50" />
                 <p className="text-xl">{t('admin.orders.cancelled_status')}</p>
                 <button 
                   onClick={() => handleStatusChange('pending')}
                   className="bg-rose-600 text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black shadow-lg shadow-rose-950/20 hover:scale-[1.05] transition-all"
                 >
                   {t('admin.orders.restore_pending')}
                 </button>
              </div>
            ) : (
              <div className="relative px-4 pb-4">
                <div className="absolute top-[22px] left-0 right-0 h-1.5 bg-neutral-50 rounded-full" />
                <div 
                  className="absolute top-[22px] left-0 h-1.5 bg-emerald-500 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  style={{ width: `${(Math.max(0, currentStatusIndex) / (STATUSES.length - 1)) * 100}%` }}
                />
                
                <div className="relative z-10 flex justify-between">
                  {STATUSES.map((status, idx) => {
                    const isCompleted = idx <= currentStatusIndex
                    const isCurrent = idx === currentStatusIndex
                    return (
                      <div 
                        key={status} 
                        className="flex flex-col items-center gap-5 cursor-pointer group flex-1"
                        onClick={() => handleStatusChange(status)}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all relative duration-500
                          ${isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-white text-neutral-200 shadow-sm'}
                          ${isCurrent ? 'scale-125 shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500/10' : ''}
                          ${isCompleted && !isCurrent ? 'hover:scale-110' : ''}
                        `}>
                          {isCompleted ? <CheckCircle2 size={24} /> : <span className="text-xs font-black">{idx + 1}</span>}
                          {isCurrent && <span className="absolute -inset-3 border-2 border-emerald-500/20 rounded-full animate-ping" />}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest text-center transition-all duration-500
                            ${isCurrent ? 'text-emerald-950 scale-110' : isCompleted ? 'text-emerald-900/60' : 'text-neutral-300'}
                          `}>
                            {getOrderStatusLabel(status, language)}
                          </span>
                          {isCurrent && <motion.div layoutId="active-dot" className="w-1 h-1 bg-[#C9A84C] rounded-full mt-1" />}
                        </div>
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
                    <XCircle size={14} /> {t('admin.orders.cancel_order')}
                  </button>
               </div>
            )}
          </section>

          <section className="luxury-card overflow-hidden">
             <div className="p-8 border-b border-emerald-950/5 flex items-center justify-between bg-neutral-50/30">
                <h2 className="text-xl font-bold font-serif text-emerald-950 flex items-center gap-3">
                  <Package size={24} className="text-[#C9A84C]" />
                  {t('admin.orders.items_title')}
                </h2>
                <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  {order.items.length} {t('admin.orders.items_count')}
                </span>
             </div>
             <table className="w-full text-left rtl:text-right">
                <thead>
                   <tr className="bg-neutral-50/50">
                      <th className="luxury-table-header px-8 py-5">{t('admin.orders.item_name')}</th>
                      <th className="luxury-table-header px-8 py-5">{t('product.quantity')}</th>
                      <th className="luxury-table-header px-8 py-5">{t('admin.orders.item_price')}</th>
                      <th className="luxury-table-header px-8 py-5 text-right rtl:text-left">{t('common.total')}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/5">
                   {order.items.map((item: any, idx: number) => (
                     <tr key={idx} className="hover:bg-neutral-50/30 transition-colors">
                        <td className="px-8 py-6">
                           <div className="font-bold text-emerald-950">{isAr ? item.product_name_ar : item.product_name_fr}</div>
                           <div className="text-[10px] font-medium text-emerald-950/40 uppercase tracking-widest mt-0.5">
                              {item.variant_label || (item.product_type === 'perfume' ? t('admin.orders.bulk') : t('admin.orders.standard'))}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                             {item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units}x`}
                           </span>
                        </td>
                        <td className="px-8 py-6 font-medium text-sm text-emerald-950/60">
                           {item.unit_price.toLocaleString()} {t('common.dzd')}
                        </td>
                        <td className="px-8 py-6 text-right rtl:text-left font-black text-emerald-950">
                           {item.total_price.toLocaleString()} {t('common.dzd')}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
              <div className="p-10 bg-neutral-50/80 backdrop-blur-sm flex justify-end items-center gap-12 border-t border-emerald-950/5">
                <div className="text-right rtl:text-left">
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/50 mb-2">{t('admin.orders.total_label')}</p>
                   <p className="text-4xl font-serif text-emerald-950 font-bold">{order.total_amount.toLocaleString()} <span className="text-sm font-sans font-medium text-emerald-950/50">{t('common.dzd')}</span></p>
                </div>
              </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm">
             <h2 className="text-xl font-bold font-serif text-emerald-950 mb-8 border-b border-emerald-950/5 pb-6 flex items-center gap-3">
                <User size={20} className="text-[#C9A84C]" />
                {t('admin.customers.profile_title')}
             </h2>
             
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <User size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C] mb-1">
                        {t('admin.customers.full_name')}
                      </p>
                      <p className="text-lg font-bold text-emerald-950">
                        {order.is_registered_customer ? t('admin.orders.customer_registered') : `${order.guest_first_name} ${order.guest_last_name}`}
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
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/80 mb-1">{t('common.contact')}</p>
                         <p className="font-bold text-emerald-950 tracking-wide">{order.guest_phone || t('admin.customers.view_profile')}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                      <MapPin size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 mb-1">{t('admin.orders.destination')}</p>
                      <p className="font-bold text-emerald-950 lowercase first-letter:uppercase tracking-wide">
                        {order.guest_wilaya || t('admin.customers.view_profile_short')} {order.guest_commune ? `- ${order.guest_commune}` : ''}
                      </p>
                   </div>
                </div>
             </div>

             {order.is_registered_customer && (
               <Link href={`/admin/customers/${order.customer_id}`} className="block mt-8">
                  <button className="w-full py-3 bg-neutral-50 text-emerald-950/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-950 transition-colors">
                     {t('admin.customers.view_full_profile')}
                  </button>
               </Link>
             )}
          </section>

          <section className="luxury-card p-8">
             <h2 className="text-xl font-bold font-serif text-emerald-950 mb-8 border-b border-emerald-950/5 pb-6 flex items-center gap-3">
                <Banknote size={20} className="text-[#C9A84C]" />
                {t('admin.orders.transaction_title')}
             </h2>
             
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between items-end mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50">{t('admin.orders.filter_payment')}</p>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
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
                         {t('admin.orders.payment_paid')}
                      </button>
                      <button 
                         onClick={() => handlePaymentUpdate('partial')}
                         className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                           order.payment_status === 'partial' ? 'bg-[#C9A84C] text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-amber-50 hover:text-[#C9A84C]'
                         }`}
                      >
                         {t('admin.orders.payment_partial')}
                      </button>
                   </div>
                   <button 
                      onClick={() => handlePaymentUpdate('unpaid')}
                      className="w-full mt-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-neutral-50 text-neutral-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                   >
                      {t('admin.orders.payment_reset')}
                   </button>
                </div>

                <div className="p-6 bg-neutral-50 rounded-3xl space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-950/40 font-medium">{t('admin.orders.payment_received')}</span>
                      <span className="font-bold text-emerald-600">{order.amount_paid.toLocaleString()} {t('common.dzd')}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs pt-4 border-t border-emerald-950/5">
                      <span className="text-emerald-950 font-bold uppercase tracking-widest text-[10px]">{t('admin.orders.payment_remaining')}</span>
                      <span className={`font-black text-lg ${remaining > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {remaining.toLocaleString()} {t('common.dzd')}
                      </span>
                   </div>
                </div>
             </div>
          </section>

          <section className="luxury-card p-8">
             <h2 className="text-xl font-bold font-serif text-emerald-950 mb-8 flex items-center gap-3 border-b border-emerald-950/5 pb-6">
                <History size={20} className="text-[#C9A84C]" />
                {t('admin.orders.history_title')}
             </h2>
             <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                {order.status_history?.slice().reverse().map((entry: any, i: number) => (
                  <div key={i} className="flex gap-4 relative pb-4 border-l-2 border-emerald-50 ml-2 pl-6">
                     <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-emerald-200" />
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/80 mb-0.5">
                          {getOrderStatusLabel(entry.status, language)}
                        </p>
                        <p className="text-[9px] text-emerald-950/30">
                          {new Date(entry.changed_at || entry.created_at).toLocaleString()}
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
