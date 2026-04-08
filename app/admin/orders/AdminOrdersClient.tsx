"use client";

import { useState, useMemo, useEffect } from 'react';
import { useOrdersStore, Order, OrderStatus, PaymentStatus } from '@/store/orders.store';
import { useSettingsStore } from '@/store/settings.store';
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

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  preparing: 'En préparation',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  preparing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-emerald-900 text-white border-emerald-800',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'bg-rose-50 text-rose-600 border-rose-100',
  partial: 'bg-amber-50 text-amber-600 border-amber-100',
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

export default function AdminOrdersClient() {
  const { orders, fetchOrders, updateStatus, updatePayment, updateNotes } = useOrdersStore();
  const settings = useSettingsStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [wilayaFilter, setWilayaFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const customerName = o.guest_first_name ? `${o.guest_first_name} ${o.guest_last_name}` : 'Client Enregistré';
      const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          customerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
      const matchWilaya = wilayaFilter === 'all' || o.guest_wilaya === wilayaFilter;
      
      return matchSearch && matchStatus && matchPayment && matchWilaya;
    });
  }, [orders, search, statusFilter, paymentFilter, wilayaFilter]);

  const handlePrint = (order: Order) => {
    const doc = generateInvoicePDF(order, settings)
    doc.save(`Facture_${order.order_number}.pdf`)
  };

  const handleUpdatePayment = async (orderId: string, amount: string) => {
    const val = parseFloat(amount) || 0;
    await updatePayment(orderId, val);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bolditalic">Carnet de Commandes</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Suivi des ventes et règlements</p>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
             <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
             <input 
               type="text"
               placeholder="Numéro de commande ou nom client..."
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-neutral-100 rounded-3xl"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-emerald-950/30 px-1">État Commande</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white border border-emerald-950/5 text-[10px] font-bold uppercase outline-none">
                  <option value="all">Tous les statuts</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-emerald-950/30 px-1">Règlement</label>
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white border border-emerald-950/5 text-[10px] font-bold uppercase outline-none">
                  <option value="all">Tous les paiements</option>
                  <option value="unpaid">Non payé</option>
                  <option value="partial">Partiel</option>
                  <option value="paid">Payé</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-emerald-950/30 px-1">Wilaya</label>
                <select value={wilayaFilter} onChange={e => setWilayaFilter(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white border border-emerald-950/5 text-[10px] font-bold uppercase outline-none">
                  <option value="all">Toutes les wilayas</option>
                  {Array.from(new Set(orders.map(o => o.guest_wilaya).filter(Boolean))).map(w => <option key={w} value={w!}>{w}</option>)}
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
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">ID / Date</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Client</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Montant / Paiement</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Progression</th>
                <th className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((order) => {
                  const name = order.guest_first_name ? `${order.guest_first_name} ${order.guest_last_name}` : `Client ID: ${order.customer_id?.slice(0, 8)}`;
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
                          <p className="font-serif text-xl text-emerald-950 font-bold">{order.order_number}</p>
                          <p className="text-[10px] font-black tracking-widest text-emerald-950/20 uppercase mt-1">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div>
                          <p className="text-sm font-bold text-emerald-950">{name}</p>
                          <p className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest mt-0.5">{order.guest_wilaya || 'Sans Wilaya'}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-emerald-950">{order.total_amount.toLocaleString()} <span className="text-[10px] font-normal opacity-50">DZD</span></span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${PAYMENT_COLORS[order.payment_status]}`}>{order.payment_status === 'paid' ? 'Payé' : order.payment_status === 'partial' ? 'Partiel' : 'Non Payé'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Banknote size={14} className="text-emerald-900/20" />
                              <input 
                                type="number"
                                placeholder="Montant payé"
                                defaultValue={order.amount_paid}
                                onBlur={(e) => handleUpdatePayment(order.id, e.target.value)}
                                className="w-24 h-8 px-2 bg-neutral-50 border border-emerald-950/5 rounded text-[10px] font-bold outline-none focus:border-amber-500 transition-colors"
                              />
                              {reste > 0 && <span className="text-[9px] font-bold text-rose-500">(-{reste.toLocaleString()})</span>}
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <select 
                           value={order.order_status}
                           onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                           className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${STATUS_COLORS[order.order_status]}`}
                         >
                           {Object.entries(STATUS_LABELS).map(([k, v]) => (
                             <option key={k} value={k}>{v.toUpperCase()}</option>
                           ))}
                         </select>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <div className="flex justify-end gap-3 h-full items-center">
                            <Link 
                              href={`/admin/orders/${order.id}`}
                              className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm"
                            >
                               <Eye size={18} />
                            </Link>
                            <button 
                              onClick={() => handlePrint(order)}
                              className="w-12 h-12 rounded-2xl bg-[#0a3d2e] flex items-center justify-center text-white shadow-xl shadow-emerald-950/10 hover:scale-[1.05] active:scale-95 transition-all"
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
             <p className="font-serif text-3xl text-emerald-950/10 italic">Aucune commande trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
