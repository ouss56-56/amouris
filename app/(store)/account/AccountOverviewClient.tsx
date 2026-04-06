"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Order, Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle2, Clock } from 'lucide-react';

interface AccountOverviewClientProps {
  user: Customer;
  orders: Order[];
}

export default function AccountOverviewClient({ user, orders }: AccountOverviewClientProps) {
  const { t, language } = useI18n();

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold mb-8">
        {language === 'ar' ? 'أهلاً بك، ' : 'Bienvenue, '}{user.firstName}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{language === 'ar' ? 'إجمالي الطلبات' : 'Total des commandes'}</CardTitle>
             <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{language === 'ar' ? 'إجمالي المنفق' : 'Total dépensé'}</CardTitle>
             <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSpent} {t('common.currency')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{language === 'ar' ? 'طلبات قيد المعالجة' : 'Commandes en cours'}</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{activeOrdersCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card border rounded-xl overflow-hidden mt-8">
        <div className="flex items-center justify-between p-6 border-b">
           <h2 className="text-xl font-bold">{language === 'ar' ? 'أحدث الطلبات' : 'Dernières commandes'}</h2>
           <Link href="/account/orders">
             <Button variant="outline" size="sm">{t('home.view_all')}</Button>
           </Link>
        </div>
        
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
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                   <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                   <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                       order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                       order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                     }`}>
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
                   <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {language === 'ar' ? 'لا توجد طلبات بعد' : 'Aucune commande pour le moment'}
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
