"use client";

import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { Order, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, MapPin, CreditCard, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { generateInvoice } from '@/lib/actions/invoices';

interface AdminOrderDetailClientProps {
  order: Order;
  customer?: Customer;
  invoice?: any;
}

export default function AdminOrderDetailClient({ order, customer, invoice: initialInvoice }: AdminOrderDetailClientProps) {
  const { language, t } = useI18n();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [invoice, setInvoice] = useState(initialInvoice);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const newInvoice = await generateInvoice(order.id);
      setInvoice(newInvoice);
      toast.success(language === 'ar' ? 'تم إنشاء الفاتورة' : 'Facture générée');
    } catch (error: any) {
      toast.error('Invoice Error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // TODO: Call updateOrder server action
      toast.success(language === 'ar' ? 'تم تحديث الطلب' : 'Commande mise à jour');
    } catch (error) {
      toast.error('Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {order.orderNumber}
          </h1>
          <Badge className={getStatusBadgeClass(order.status)}>
            {order.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {invoice ? (
            <Link href={invoice.pdf_url} target="_blank">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                {language === 'ar' ? 'الفاتورة' : 'Facture'}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={handleGenerateInvoice} disabled={isGenerating} className="gap-2">
              <Plus className="w-4 h-4" />
              {isGenerating ? '...' : (language === 'ar' ? 'إنشاء فاتورة' : 'Générer facture')}
            </Button>
          )}
          <Button onClick={handleUpdate} disabled={isUpdating} className="gap-2">
            <Save className="w-4 h-4" />
            {isUpdating ? '...' : (language === 'ar' ? 'حفظ' : 'Enregistrer')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'المنتجات' : 'Produits'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{language === 'ar' ? item.productNameAR : item.productNameFR}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x {item.unitPrice} DZD</p>
                    </div>
                    <p className="font-bold">{item.quantity * item.unitPrice} DZD</p>
                  </div>
                ))}
                <div className="pt-4 space-y-2">
                   <div className="flex justify-between text-sm">
                      <span>{t('cart.subtotal')}</span>
                      <span>{order.total - 800} DZD</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span>{language === 'ar' ? 'التوصيل' : 'Livraison'}</span>
                      <span>800 DZD</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-primary">{order.total} DZD</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
             <CardHeader>
                <CardTitle>{language === 'ar' ? 'تحديث الحالة' : 'Mise à jour rapide'}</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium">{language === 'ar' ? 'حالة الطلب' : 'Statut de commande'}</label>
                   <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">{language === 'ar' ? 'حالة الدفع' : 'Statut de paiement'}</label>
                   <Select value={paymentStatus} onValueChange={(v: any) => setPaymentStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">{language === 'ar' ? 'العميل' : 'Client'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer ? (
                <>
                  <div>
                    <p className="font-bold">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-muted-foreground">{customer.shopName}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground">{language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</p>
                    <p dir="ltr">{customer.phoneNumber}</p>
                  </div>
                </>
              ) : order.guestInfo ? (
                <>
                  <div>
                    <p className="font-bold">{order.guestInfo.firstName} {order.guestInfo.lastName}</p>
                    <Badge variant="secondary">Guest</Badge>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground">{language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</p>
                    <p dir="ltr">{order.guestInfo.phoneNumber}</p>
                  </div>
                </>
              ) : (
                <p className="text-destructive font-bold">Unknown Customer</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">{language === 'ar' ? 'العنوان' : 'Adresse'}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-bold">{customer?.wilaya || order.guestInfo?.wilaya}</p>
              <p>{customer?.commune || 'Alger'}</p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">{language === 'ar' ? 'الدفع' : 'Paiement'}</CardTitle>
            </CardHeader>
            <CardContent>
               <Badge className={paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}>
                 {paymentStatus.toUpperCase()}
               </Badge>
            </CardContent>
          </Card>
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
