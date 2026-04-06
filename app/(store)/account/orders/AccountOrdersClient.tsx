"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface AccountOrdersClientProps {
  orders: Order[];
}

export default function AccountOrdersClient({ orders }: AccountOrdersClientProps) {
  const { t, language } = useI18n();

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
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}>
                       {order.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 font-bold">{order.total} {t('common.currency')}</td>
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

function getStatusStyles(status: string) {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-cyan-100 text-cyan-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
