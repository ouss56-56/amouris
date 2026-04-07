"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AccountOrdersClientProps {
  orders: Order[];
  customerId: string;
}

export default function AccountOrdersClient({ orders: initialOrders, customerId }: AccountOrdersClientProps) {
  const { t, language } = useI18n();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${customerId}`
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { 
              ...o, 
              status: payload.new.order_status,
              paymentStatus: payload.new.payment_status,
              amountPaid: Number(payload.new.amount_paid),
              updatedAt: payload.new.updated_at
            } : o));
          } else if (payload.eventType === 'INSERT') {
            // Usually orders are added through the checkout flow, but handle just in case
            window.location.reload(); // Harder to map full DB order to frontend Order type here without fetch
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, customerId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold">
          {language === 'ar' ? 'طلباتي' : 'Mes Commandes'}
        </h1>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase border-b">
              <tr>
                <th className="px-6 py-4">{language === 'ar' ? 'رقم الطلب' : 'N° Commande'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'الحالة' : 'Statut'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                   <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                   <td className="px-6 py-4 text-muted-foreground">
                     {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })}
                   </td>
                   <td className="px-6 py-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                       {getStatusBadgeLabel(order.status, language)}
                     </span>
                   </td>
                   <td className="px-6 py-4 font-bold">{order.total.toLocaleString()} {t('common.currency')}</td>
                   <td className="px-6 py-4 text-right">
                     <Link href={`/account/orders/${order.id}`}>
                       <Button variant="ghost" size="sm">{t('product.details')}</Button>
                     </Link>
                   </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                     {language === 'ar' ? 'لا توجد طلبات سابقة بعد' : 'Aucune commande passée pour le moment'}
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
    case 'delivered': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'confirmed': return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'preparing': return 'bg-blue-100/50 text-blue-700 border border-blue-200';
    case 'shipped': return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
    case 'cancelled': return 'bg-rose-100 text-rose-800 border border-rose-200';
    default: return 'bg-slate-100 text-slate-800 border border-slate-200';
  }
}
