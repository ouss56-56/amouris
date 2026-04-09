import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Order, Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle2, Clock } from 'lucide-react';
import { getOrderStatusLabel } from '@/lib/status-helpers';

interface AccountOverviewClientProps {
  user: Customer;
  orders: Order[];
}

export default function AccountOverviewClient({ user, orders }: AccountOverviewClientProps) {
  const { t, language } = useI18n();

  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.order_status)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-emerald-950 mb-8">
        {language === 'ar' ? 'مرحباً، ' : 'Bienvenue, '}{user.first_name}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Commandes'}</span>
              <Package className="h-4 w-4 text-[#C9A84C]" />
           </div>
           <div className="text-3xl font-serif text-emerald-950">{orders.length}</div>
        </div>
        
        <div className="bg-[#0a3d2e] p-6 rounded-3xl border border-emerald-950/5 shadow-xl shadow-emerald-900/10">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{language === 'ar' ? 'إجمالي المشتريات' : 'Dépenses Totales'}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
           </div>
           <div className="text-3xl font-serif text-white">{totalSpent.toLocaleString()} <span className="text-xs opacity-40">DZD</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">{language === 'ar' ? 'طلبات قيد التنفيذ' : 'Commandes Actives'}</span>
              <Clock className="h-4 w-4 text-amber-500" />
           </div>
           <div className="text-3xl font-serif text-emerald-950">{activeOrdersCount}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-emerald-950/5 rounded-3xl overflow-hidden mt-12 shadow-sm">
        <div className="flex items-center justify-between p-8 border-b border-emerald-950/5">
           <h2 className="font-serif text-xl text-emerald-950">{language === 'ar' ? 'الطلبات الأخيرة' : 'Commandes Récentes'}</h2>
           <Link href="/account/orders">
             <Button variant="outline" size="sm" className="rounded-xl border-emerald-950/5 text-[10px] font-black uppercase tracking-widest">{language === 'ar' ? 'عرض الكل' : 'Voir tout'}</Button>
           </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-[9px] uppercase font-black tracking-widest text-emerald-950/20 bg-neutral-50/50 border-b border-emerald-950/5">
              <tr>
                <th className="px-8 py-4">{language === 'ar' ? 'رقم الطلب' : 'Réf. Commande'}</th>
                <th className="px-8 py-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="px-8 py-4">{language === 'ar' ? 'الحالة' : 'Statut'}</th>
                <th className="px-8 py-4">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b border-emerald-950/5 last:border-0 hover:bg-neutral-50/50 transition-colors">
                   <td className="px-8 py-6 font-bold font-mono text-emerald-950">{order.order_number}</td>
                   <td className="px-8 py-6 text-emerald-950/40">{new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</td>
                   <td className="px-8 py-6">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       order.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                       ['pending', 'confirmed'].includes(order.order_status) ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                     }`}>
                        {getOrderStatusLabel(order.order_status, language)}
                     </span>
                   </td>
                   <td className="px-8 py-6 font-bold text-emerald-950">{order.total_amount.toLocaleString()} DZD</td>
                   <td className="px-8 py-6 text-right">
                     <Link href={`/account/orders/${order.id}`}>
                       <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[9px] text-[#C9A84C] hover:text-[#0a3d2e] hover:bg-emerald-50">Détails</Button>
                     </Link>
                   </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-emerald-950/20 italic font-serif text-lg">
                    {language === 'ar' ? 'لا توجد طلبات حالياً' : 'Aucune commande pour le moment.'}
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
