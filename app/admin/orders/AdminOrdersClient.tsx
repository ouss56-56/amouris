"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Clock, CheckCircle2, 
  Truck, XCircle, AlertCircle, FileText, 
  Printer, ChevronRight, Eye, Banknote,
  MoreVertical,
  X
} from 'lucide-react';
import { generateInvoicePDF } from '@/lib/utils/invoice-generator';
import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { OrderStatus, PaymentStatus } from '@/store/orders.store';
import { updateOrderStatus as apiUpdateOrderStatus, updateOrderPayment as apiUpdateOrderPayment } from '@/lib/api/orders';
import { useRouter } from 'next/navigation';
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/status-helpers';

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-orange-100 text-orange-800 border-orange-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
};

interface AdminOrdersClientProps {
  initialOrders: any[];
  settings: any;
}

export default function AdminOrdersClient({ initialOrders, settings }: AdminOrdersClientProps) {
  const router = useRouter();
  const { t, language } = useI18n();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [wilayaFilter, setWilayaFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const orders = initialOrders;

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const customerName = o.guest_first_name ? `${o.guest_first_name} ${o.guest_last_name}` : t('admin.orders.customer_unknown');
      const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          customerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
      const matchWilaya = wilayaFilter === 'all' || o.guest_wilaya === wilayaFilter;
      
      return matchSearch && matchStatus && matchPayment && matchWilaya;
    });
  }, [orders, search, statusFilter, paymentFilter, wilayaFilter, t]);

  const handlePrint = async (order: any) => {
    try {
      const doc = await generateInvoicePDF(order, settings)
      const filename = language === 'ar' ? `فاتورة_${order.order_number}.pdf` : `Facture_${order.order_number}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF')
    }
  };

  const handleUpdatePayment = async (orderId: string, amount: string) => {
    const val = parseFloat(amount) || 0;
    try {
      await apiUpdateOrderPayment(orderId, val);
      router.refresh();
    } catch (err) {
      alert('Erreur lors de la mise à jour du paiement');
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await apiUpdateOrderStatus(orderId, status);
      router.refresh();
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <h1 className="font-serif text-5xl text-emerald-950 mb-2 font-bold italic">{t('admin.orders.title')}</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#C9A84C]/80">{t('admin.orders.subtitle')}</p>
        </motion.div>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
             <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C9A84C] transition-colors" />
             <input 
               type="text"
               placeholder={t('admin.orders.search_placeholder')}
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
             />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-16 px-8 rounded-2xl border flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-emerald-950/5 text-gray-500 hover:text-emerald-950'}`}
          >
            <Filter size={16} /> {showFilters ? t('admin.orders.reduce') : t('admin.orders.filters')}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-neutral-100/80 backdrop-blur-md rounded-[2.5rem] border border-emerald-950/5"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">{t('admin.orders.filter_status')}</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 text-[11px] font-bold uppercase outline-none focus:border-[#C9A84C] transition-all">
                  <option value="all">{t('admin.orders.status_all')}</option>
                  {STATUS_ORDER.map((k) => <option key={k} value={k}>{getOrderStatusLabel(k, language)}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">{t('admin.orders.filter_payment')}</label>
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 text-[11px] font-bold uppercase outline-none focus:border-[#C9A84C] transition-all">
                  <option value="all">{t('admin.orders.payment_all')}</option>
                  <option value="unpaid">{t('admin.orders.payment_unpaid')}</option>
                  <option value="partial">{t('admin.orders.payment_partial')}</option>
                  <option value="paid">{t('admin.orders.payment_paid')}</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">{t('admin.orders.filter_wilaya')}</label>
                <select value={wilayaFilter} onChange={e => setWilayaFilter(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 text-[11px] font-bold uppercase outline-none focus:border-[#C9A84C] transition-all">
                  <option value="all">{t('admin.orders.wilaya_all')}</option>
                  {Array.from(new Set(orders.map(o => o.guest_wilaya).filter(Boolean))).map(w => <option key={w} value={w!}>{w}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="luxury-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="luxury-table-header">{t('admin.orders.table.id_date')}</th>
                <th className="luxury-table-header">{t('admin.orders.table.customer')}</th>
                <th className="luxury-table-header">{t('admin.orders.table.amount_payment')}</th>
                <th className="luxury-table-header">{t('admin.orders.table.progress')}</th>
                <th className="luxury-table-header text-right rtl:text-left">{t('admin.orders.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((order) => {
                  const name = order.guest_first_name ? `${order.guest_first_name} ${order.guest_last_name}` : `${t('common.account')} ID: ${order.customer_id?.slice(0, 8)}`;
                  const reste = order.total_amount - order.amount_paid;
                  
                  return (
                    <motion.tr 
                      layout
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-neutral-50/20 transition-all font-sans"
                    >
                      <td className="px-10 py-8">
                        <div>
                          <p className="font-serif text-2xl text-emerald-950 font-bold">{order.order_number}</p>
                          <p className="text-[10px] font-black tracking-widest text-[#C9A84C] uppercase mt-1">
                            {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div>
                          <p className="text-sm font-bold text-emerald-950">{name}</p>
                          <p className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest mt-0.5">{order.guest_wilaya || t('admin.orders.no_wilaya')}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-emerald-950">{order.total_amount.toLocaleString()} <span className="text-[10px] font-normal opacity-50">{t('common.dzd')}</span></span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${PAYMENT_COLORS[order.payment_status]}`}>{getPaymentStatusLabel(order.payment_status, language)}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Banknote size={14} className="text-emerald-900/20" />
                              <input 
                                type="number"
                                placeholder={t('admin.orders.table.amount_payment')}
                                defaultValue={order.amount_paid}
                                onBlur={(e) => handleUpdatePayment(order.id, e.target.value)}
                                className="w-24 h-9 px-3 bg-neutral-50 border border-emerald-950/10 rounded-lg text-[11px] font-bold outline-none focus:border-[#C9A84C] transition-all"
                              />
                              {reste > 0 && <span className="text-[9px] font-bold text-rose-500">(-{reste.toLocaleString()})</span>}
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <select 
                           value={order.order_status}
                           onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                           className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${STATUS_COLORS[order.order_status]}`}
                         >
                           {STATUS_ORDER.map((k) => (
                             <option key={k} value={k}>{getOrderStatusLabel(k, language).toUpperCase()}</option>
                           ))}
                         </select>
                      </td>
                      <td className="px-10 py-8 text-right rtl:text-left">
                         <div className="flex justify-end rtl:justify-start gap-3 h-full items-center">
                            <Link 
                              href={`/admin/orders/${order.id}`}
                              className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm"
                              title={t('admin.orders.view_details')}
                            >
                               <Eye size={18} />
                            </Link>
                            <button 
                              onClick={() => handlePrint(order)}
                              className="w-12 h-12 rounded-2xl bg-[#0a3d2e] flex items-center justify-center text-white shadow-xl shadow-emerald-950/10 hover:scale-[1.05] active:scale-95 transition-all"
                              title={t('admin.orders.print_invoice')}
                            >
                               <Printer size={18} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center bg-neutral-50/20">
             <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-emerald-100 border border-emerald-950/5">
                <FileText size={40} />
             </div>
             <p className="font-serif text-3xl text-emerald-950/10 italic">{t('admin.orders.none_found')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
