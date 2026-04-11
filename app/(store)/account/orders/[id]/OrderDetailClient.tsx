"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle2, ChevronRight, Package, Receipt, CreditCard, XCircle } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/generate-invoice';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import OrderInvoice from '@/components/store/OrderInvoice';

interface OrderDetailClientProps {
  order: any;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const { language } = useI18n();
  const [showInvoice, setShowInvoice] = useState(false);
  const isAr = language === 'ar';

  const statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];
  const isCancelled = order.order_status === 'cancelled';
  const currentStatusIndex = isCancelled ? -1 : statuses.indexOf(order.order_status);

  const statusLabels: Record<string, { ar: string; fr: string }> = {
    'pending': { ar: 'قيد الانتظار', fr: 'En attente' },
    'confirmed': { ar: 'مؤكد', fr: 'Confirmé' },
    'preparing': { ar: 'قيد التحضير', fr: 'En préparation' },
    'shipped': { ar: 'تم الشحن', fr: 'Expédié' },
    'delivered': { ar: 'تم التوصيل', fr: 'Livré' },
    'cancelled': { ar: 'ملغى', fr: 'Annulé' },
  };

  const remaining = order.total_amount - (order.amount_paid || 0);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/account/orders">
            <button className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950 hover:bg-emerald-50 transition-colors">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-emerald-950">
              {isAr ? 'تفاصيل الطلب' : 'Détails de la commande'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">
              {order.order_number}
            </p>
          </div>
        </div>

        {order.invoice_generated && order.invoice_data && (
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="rounded-2xl border-emerald-950/10 text-emerald-900 hover:bg-[#0a3d2e] hover:text-white uppercase tracking-widest text-[10px] font-black px-8 py-6 h-auto"
              onClick={() => setShowInvoice(!showInvoice)}
            >
              <Receipt className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
              {showInvoice ? (isAr ? 'إخفاء الفاتورة' : 'Masquer la facture') : (isAr ? 'عرض الفاتورة' : 'Afficher la facture')}
            </Button>
            <Button 
              variant="outline" 
              className="rounded-2xl border-emerald-950/10 text-emerald-900 hover:bg-[#0a3d2e] hover:text-white uppercase tracking-widest text-[10px] font-black px-8 py-6 h-auto"
              onClick={() => generateInvoicePDF(order.invoice_data!)}
            >
              <FileText className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
              {isAr ? 'تحميل (PDF)' : 'Télécharger PDF'}
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showInvoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <OrderInvoice order={order} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <section className="bg-white p-8 md:p-12 rounded-[3rem] border border-emerald-950/5 shadow-sm">
        <h2 className="font-serif text-2xl text-emerald-950 mb-12">
          {isAr ? 'تتبع الطلب' : 'Suivi de commande'}
        </h2>
        
        {isCancelled ? (
          <div className="p-12 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-bold text-center flex flex-col items-center justify-center gap-4">
            <XCircle size={48} className="mb-2" />
            <h3 className="text-xl">{isAr ? 'تم إلغاء هذا الطلب' : 'Cette commande a été annulée'}</h3>
            <p className="text-sm font-medium opacity-60 max-w-md">
              {isAr ? 'نعتذر، لقد تم إلغاء طلبكم. للمزيد من المعلومات يرجى الاتصال بخدمة العملاء.' : "Nous sommes désolés, votre commande a été annulée. Pour plus d'informations, veuillez contacter notre service client."}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Timeline */}
            <div className="hidden md:flex justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-neutral-100" />
              <div 
                className="absolute top-5 left-0 h-[2px] bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
              />
              
              {statuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={status} className="relative z-10 flex flex-col items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative ${
                      isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-neutral-50 text-neutral-200'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                      {isCurrent && (
                        <span className="absolute -inset-2 border-2 border-emerald-500/30 rounded-full animate-ping" />
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-center ${
                      isCurrent ? 'text-emerald-600 font-black' : isCompleted ? 'text-emerald-950/60' : 'text-neutral-300'
                    }`}>
                      {isAr ? statusLabels[status].ar : statusLabels[status].fr}
                    </span>
                    {isCurrent && order.status_history?.find(h => h.status === status) && (
                      <span className="text-[9px] opacity-40 font-medium">
                        {new Date(order.status_history.filter(h => h.status === status).pop()!.changed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-12 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-neutral-100 rtl:before:left-auto rtl:before:right-4">
              {statuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={status} className="flex gap-6 items-start relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 shrink-0 transition-all relative ${
                      isCompleted ? 'bg-emerald-500 border-zinc-50 text-white' : 'bg-white border-neutral-50 text-neutral-200'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                      {isCurrent && (
                        <span className="absolute -inset-1.5 border border-emerald-500/30 rounded-full animate-ping" />
                      )}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                        isCurrent ? 'text-emerald-600 font-black' : isCompleted ? 'text-emerald-950/60' : 'text-neutral-300'
                      }`}>
                        {isAr ? statusLabels[status].ar : statusLabels[status].fr}
                      </span>
                      {isCurrent && (
                        <div className="space-y-1">
                          <p className="text-xs text-emerald-950/40">
                             {isAr ? 'طلبك قيد المعالجة حالياً' : 'Votre commande est en cours'}
                          </p>
                          {order.status_history?.find(h => h.status === status) && (
                             <p className="text-[9px] opacity-40">
                               {new Date(order.status_history.filter(h => h.status === status).pop()!.changed_at).toLocaleString()}
                             </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] border border-emerald-950/5 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-emerald-950/5 bg-neutral-50/30 flex items-center gap-4">
              <Package className="text-emerald-950/20" />
              <h3 className="font-serif text-xl text-emerald-950">{isAr ? 'المنتجات المطلوبة' : 'Articles commandés'}</h3>
            </div>
            <div className="divide-y divide-emerald-950/5">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-8 flex items-center justify-between gap-6 group hover:bg-neutral-50/50 transition-colors">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-emerald-900/10 group-hover:scale-110 transition-transform">
                      <Receipt size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">
                        {isAr ? item.product_name_ar : item.product_name_fr}
                      </h4>
                      <p className="text-xs text-emerald-950/40 font-medium">
                        {item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units} unités`} 
                        <span className="mx-2 opacity-30">×</span>
                        {item.unit_price.toLocaleString()} DZD
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg text-emerald-950">{item.total_price.toLocaleString()} <span className="text-[10px] font-sans opacity-40">DZD</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a3d2e] p-8 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 space-y-8">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100/40 mb-6 border-b border-emerald-400/10 pb-4">
                     {isAr ? 'ملخص الدفع' : 'Résumé du paiement'}
                   </h3>
                   <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                         <span className="text-emerald-100/60 font-medium">{isAr ? 'المجموع' : 'Total'}</span>
                         <span className="font-bold">{order.total_amount.toLocaleString()} DZD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-emerald-100/60 font-medium">{isAr ? 'المدفوع' : 'Payé'}</span>
                         <span className="font-bold text-emerald-400">{order.amount_paid.toLocaleString()} DZD</span>
                      </div>
                      <div className="pt-4 border-t border-emerald-400/10 flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'المتبقي' : 'Reste à payer'}</span>
                         <span className="font-serif text-3xl text-amber-400">{remaining.toLocaleString()} <span className="text-xs font-sans">DZD</span></span>
                      </div>
                   </div>
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-2xl ${order.payment_status === 'paid' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                   <CreditCard size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest">
                      {order.payment_status === 'paid' ? (isAr ? 'تم الدفع كلياً' : 'Paiement complet') : (isAr ? 'دفع جزئي / عند الاستلام' : 'Paiement partiel / Livraison')}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
