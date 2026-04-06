"use client";

import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { Order, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AdminOrdersClientProps {
  orders: Order[];
  customers: Customer[];
}

export default function AdminOrdersClient({ orders, customers }: AdminOrdersClientProps) {
  const { t, language } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(o => {
    let customerName = '';
    if (o.customerId === 'guest' && o.guestInfo) {
      customerName = `${o.guestInfo.firstName} ${o.guestInfo.lastName}`;
    } else {
      const customer = customers.find(c => c.id === o.customerId);
      customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
    }
    
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'الطلبات' : 'Commandes'}
        </h1>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
            <Input 
              placeholder={language === 'ar' ? 'بحث بالرقم أو العميل...' : 'Recherche par n° ou client...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rtl:pr-9 rtl:pl-3"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous (الكل)</SelectItem>
              <SelectItem value="pending">En attente (قيد الانتظار)</SelectItem>
              <SelectItem value="confirmed">Confirmé (مؤكد)</SelectItem>
              <SelectItem value="shipped">Expédié (تم الشحن)</SelectItem>
              <SelectItem value="delivered">Livré (تم التوصيل)</SelectItem>
              <SelectItem value="cancelled">Annulé (ملغى)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4">N° Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                let customerName = 'Unknown';
                let customerWilaya = '';
                
                if (order.customerId === 'guest' && order.guestInfo) {
                  customerName = `${order.guestInfo.firstName} ${order.guestInfo.lastName} (Guest)`;
                  customerWilaya = order.guestInfo.wilaya;
                } else {
                  const customer = customers.find(c => c.id === order.customerId);
                  if (customer) {
                    customerName = `${customer.firstName} ${customer.lastName}`;
                    customerWilaya = customer.wilaya;
                  }
                }
                
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4 font-bold">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{customerName}</p>
                      <p className="text-xs text-muted-foreground">{customerWilaya}</p>
                    </td>
                    <td className="px-6 py-4">{order.items.length} items</td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {order.total.toLocaleString()} {t('common.currency')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={
                        order.paymentStatus === 'paid' ? 'border-emerald-500 text-emerald-600' : 
                        order.paymentStatus === 'partial' ? 'border-blue-500 text-blue-600' :
                        'border-amber-500 text-amber-600'
                      }>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {order.paymentStatus === 'paid' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Aucune commande trouvée.
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

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'delivered': return 'bg-emerald-500 hover:bg-emerald-600';
    case 'pending': return 'bg-amber-500 hover:bg-amber-600';
    case 'confirmed': return 'bg-blue-500 hover:bg-blue-600';
    case 'preparing': return 'bg-cyan-500 hover:bg-cyan-600';
    case 'shipped': return 'bg-purple-500 hover:bg-purple-600';
    case 'cancelled': return 'bg-destructive hover:bg-destructive/90';
    default: return '';
  }
}
