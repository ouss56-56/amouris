"use client";

import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { Order, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';

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

  const handleExport = () => {
    try {
      const headers = ['Order Number', 'Date', 'Customer', 'Shop', 'Wilaya', 'Items Count', 'Total Amount', 'Payment Status', 'Order Status'];
      const rows = filteredOrders.map(o => {
        const customer = customers.find(c => c.id === o.customerId);
        const name = o.guestInfo ? `${o.guestInfo.firstName} ${o.guestInfo.lastName}` : (customer ? `${customer.firstName} ${customer.lastName}` : 'N/A');
        const shop = customer?.shopName || 'Retail';
        const wilaya = o.guestInfo?.wilaya || customer?.wilaya || 'N/A';
        
        return [
          o.orderNumber,
          new Date(o.createdAt || Date.now()).toLocaleDateString(),
          name,
          shop,
          wilaya,
          o.items?.length || 0,
          o.total || 0,
          o.paymentStatus,
          o.status
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `amouris-orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(language === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Données exportées avec succès');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(language === 'ar' ? 'فشل تصدير البيانات' : 'Échec de l\'exportation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'إدارة الطلبات' : 'Gestion des Commandes'}
        </h1>
        <Button variant="outline" onClick={handleExport} className="gap-2 border-primary/20 hover:bg-primary/5">
          <Download className="w-4 h-4" />
          {language === 'ar' ? 'تصدير (Excel)' : 'Exporter (CSV)'}
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
            <Input 
              placeholder={language === 'ar' ? 'بحث برقم الطلب أو اسم العميل...' : 'Recherche par commande ou client...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rtl:pr-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'Tous les statuts'}</SelectItem>
              <SelectItem value="pending">{language === 'ar' ? 'قيد الانتظار' : 'En attente'}</SelectItem>
              <SelectItem value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmé'}</SelectItem>
              <SelectItem value="preparing">{language === 'ar' ? 'قيد التحضير' : 'En préparation'}</SelectItem>
              <SelectItem value="shipped">{language === 'ar' ? 'تم الشحن' : 'Expédié'}</SelectItem>
              <SelectItem value="delivered">{language === 'ar' ? 'تم التوصيل' : 'Livré'}</SelectItem>
              <SelectItem value="cancelled">{language === 'ar' ? 'ملغى' : 'Annulé'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b">
              <tr>
                <th className="px-6 py-4">N° Commande</th>
                <th className="px-6 py-4">Client / Wilaya</th>
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
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{customerName}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase">{customerWilaya}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{(order as Order & { itemsCount?: number }).itemsCount || order.items?.length || 0} art.</td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {order.total.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase">{t('common.currency')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getPaymentBadgeClass(order.paymentStatus)}>
                        {order.paymentStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`shadow-none font-semibold ${getStatusBadgeClass(order.status)}`}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10">
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100" title="Imprimer Bon">
                          <Printer className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                    {language === 'ar' ? 'لا توجد طلبات تطابق هذا البحث' : 'Aucune commande trouvée pour ces critères.'}
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

function getPaymentBadgeClass(status: string) {
  switch (status) {
    case 'paid': return 'border-emerald-500 text-emerald-600 bg-emerald-50';
    case 'partial': return 'border-blue-500 text-blue-600 bg-blue-50';
    case 'unpaid': return 'border-amber-500 text-amber-600 bg-amber-50';
    default: return 'border-slate-300 text-slate-600';
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'delivered': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    case 'pending': return 'bg-amber-500 hover:bg-amber-600 text-white';
    case 'confirmed': return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'preparing': return 'bg-sky-500 hover:bg-sky-600 text-white';
    case 'shipped': return 'bg-indigo-500 hover:bg-indigo-600 text-white';
    case 'cancelled': return 'bg-rose-600 hover:bg-rose-700 text-white';
    default: return 'bg-slate-500 text-white';
  }
}
