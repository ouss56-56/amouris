"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { useOrdersStore } from '@/store/orders.store';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AccountOrdersClient({ customerId }: { customerId: string }) {
  const { t, language } = useI18n();
  const getOrders = useOrdersStore(s => s.getByCustomer);
  
  // Needs to be in useEffect to avoid hydration mismatch if store initializes differently
  const [orders, setOrders] = useState<ReturnType<typeof getOrders>>([]);

  useEffect(() => {
    setOrders(getOrders(customerId));
  }, [customerId, getOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Package className="h-8 w-8 text-emerald-900" />
        <h1 className="text-3xl font-serif font-bold text-emerald-950">
          {language === 'ar' ? 'طلباتي' : 'Mes Commandes'}
        </h1>
      </div>

      <div className="bg-white border border-emerald-950/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-[10px] font-black tracking-widest text-emerald-950/40 bg-neutral-50/50 uppercase border-b border-emerald-950/5">
              <tr>
                <th className="px-6 py-5">{language === 'ar' ? 'رقم الطلب' : 'N° Commande'}</th>
                <th className="px-6 py-5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-5">{language === 'ar' ? 'الحالة' : 'Statut'}</th>
                <th className="px-6 py-5">{language === 'ar' ? 'المدفوع' : 'Montant payé'}</th>
                <th className="px-6 py-5">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5 text-emerald-950">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                   <td className="px-6 py-5 font-bold font-mono">{order.order_number}</td>
                   <td className="px-6 py-5 text-emerald-950/50 font-medium">
                     {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })}
                   </td>
                   <td className="px-6 py-5">
                     <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${getStatusStyles(order.order_status)}`}>
                       {getStatusBadgeLabel(order.order_status, language)}
                     </span>
                   </td>
                   <td className="px-6 py-5">
                     <span className={order.amount_paid >= order.total_amount ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {order.amount_paid.toLocaleString()} {t('common.currency')}
                     </span>
                   </td>
                   <td className="px-6 py-5 font-bold text-lg">{order.total_amount.toLocaleString()} <span className="text-[10px] font-normal uppercase tracking-widest text-emerald-950/40">DZD</span></td>
                   <td className="px-6 py-5 text-right">
                     <Link href={`/account/orders/${order.id}`}>
                       <Button variant="outline" size="sm" className="rounded-xl border-emerald-950/10 text-emerald-900 hover:bg-emerald-900 hover:text-white uppercase tracking-widest text-[10px] font-black h-8">
                         {t('product.details')}
                       </Button>
                     </Link>
                   </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center">
                     <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Package className="text-emerald-900/20" size={24} />
                     </div>
                     <p className="font-serif italic text-emerald-950/40 text-lg">
                        {language === 'ar' ? 'لا توجد طلبات سابقة بعد' : 'Aucune commande passée pour le moment'}
                     </p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeLabel(status: string, lang: 'ar' | 'fr') {
  const labels: Record<string, { ar: string; fr: string }> = {
    pending: { ar: 'قيد الانتظار', fr: 'En attente' },
    confirmed: { ar: 'مؤكد', fr: 'Confirmé' },
    preparing: { ar: 'قيد التحضير', fr: 'En préparation' },
    shipped: { ar: 'تم الشحن', fr: 'Expédié' },
    delivered: { ar: 'تم التوصيل', fr: 'Livré' },
    cancelled: { ar: 'ملغى', fr: 'Annulé' },
  };
  return labels[status]?.[lang] || status;
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'delivered': return 'bg-emerald-100/50 text-emerald-800 border border-emerald-200';
    case 'pending': return 'bg-amber-100/50 text-amber-800 border border-amber-200';
    case 'confirmed': return 'bg-blue-100/50 text-blue-800 border border-blue-200';
    case 'preparing': return 'bg-indigo-100/50 text-indigo-700 border border-indigo-200';
    case 'shipped': return 'bg-cyan-100/50 text-cyan-800 border border-cyan-200';
    case 'cancelled': return 'bg-rose-100/50 text-rose-800 border border-rose-200';
    default: return 'bg-slate-100/50 text-slate-800 border border-slate-200';
  }
}
