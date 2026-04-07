"use client";

import { useI18n } from '@/i18n/i18n-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, Customer } from '@/lib/types';
import { ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AdminDashboardClientProps {
  orders: Order[];
  customers: Customer[];
}

export default function AdminDashboardClient({ orders: initialOrders, customers }: AdminDashboardClientProps) {
  const { t, language } = useI18n();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            // New order - refresh list (simplified)
            window.location.reload(); 
          } else if (payload.eventType === 'UPDATE') {
            const { id, order_status, payment_status, amount_paid } = payload.new;
            setOrders(prev => prev.map(o => o.id === id ? { 
              ...o, 
              status: order_status as any, 
              paymentStatus: payment_status as any,
              amountPaid: Number(amount_paid),
            } : o));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // KPIs
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  // Charts logic (omitted for brevity)
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'إجمالي الإيرادات' : 'Revenu Total'}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalRevenue.toLocaleString()} {t('common.currency')}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'الطلبات' : 'Commandes'}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'العملاء' : 'Clients'}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm bg-card ${pendingOrders > 0 ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/10' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${pendingOrders > 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>
              {language === 'ar' ? 'طلبات بانتظار المعالجة' : 'Commandes en attente'}
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${pendingOrders > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'الإيرادات' : 'Revenus'}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3'}}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0A6B4B" strokeWidth={3} dot={{r: 4, fill: '#0A6B4B'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'أحدث الطلبات' : 'Dernières commandes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/30 p-2 rounded-md transition-colors">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{customer?.firstName || order.guestInfo?.firstName} {customer?.lastName || order.guestInfo?.lastName || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-primary">{order.total.toLocaleString()} {t('common.currency')}</p>
                       <p className={`text-xs font-semibold ${order.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                         {order.status.toUpperCase()}
                       </p>
                    </div>
                  </div>
                )
              })}
              {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground italic">
                   {language === 'ar' ? 'لا توجد طلبات بعد' : 'Aucune commande pour le moment'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
