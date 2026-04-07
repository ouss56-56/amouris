"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

interface OrderDetailClientProps {
  order: Order;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoice?: any;
}

export default function OrderDetailClient({ order, invoice }: OrderDetailClientProps) {
  const { t, language } = useI18n();

  const statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  const statusLabels: Record<string, string> = {
    'pending': language === 'ar' ? 'قيد الانتظار' : 'En attente',
    'confirmed': language === 'ar' ? 'مؤكد' : 'Confirmé',
    'preparing': language === 'ar' ? 'قيد التحضير' : 'En préparation',
    'shipped': language === 'ar' ? 'تم الشحن' : 'Expédié',
    'delivered': language === 'ar' ? 'تم التوصيل' : 'Livré',
    'cancelled': language === 'ar' ? 'ملغى' : 'Annulé',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </Button>
        </Link>
        <h1 className="text-3xl font-heading font-bold">
          {language === 'ar' ? 'تفاصيل الطلب' : 'Détails de la commande'} #{order.orderNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Status Stepper */}
          <div className="bg-card border rounded-xl p-6">
             <h2 className="text-xl font-bold mb-6">{language === 'ar' ? 'حالة الطلب' : 'Statut de la commande'}</h2>
             
             {order.status === 'cancelled' ? (
               <div className="p-4 bg-destructive/10 text-destructive rounded-md font-bold text-center">
                 {statusLabels['cancelled']}
               </div>
             ) : (
               <div className="relative flex justify-between">
                 <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-muted rounded-full overflow-hidden" style={{ zIndex: 0 }}>
                   <div 
                     className="h-full bg-primary transition-all duration-500" 
                     style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
                   />
                 </div>
                 
                 {statuses.map((status, index) => {
                   const isCompleted = index <= currentStatusIndex;
                   const isCurrent = index === currentStatusIndex;
                   return (
                     <div key={status} className="relative z-10 flex flex-col items-center gap-2">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                         isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'
                       }`}>
                         {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                       </div>
                       <span className={`text-xs md:text-sm font-medium hidden sm:block ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                         {statusLabels[status]}
                       </span>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>

          {/* Items */}
          <div className="bg-card border rounded-xl overflow-hidden text-sm">
             <div className="p-4 border-b bg-secondary/30">
                <h2 className="text-lg font-bold">{language === 'ar' ? 'المنتجات' : 'Produits'}</h2>
             </div>
             <div>
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-muted/30">
                   <div>
                     <div className="font-semibold">{language === 'ar' ? item.productNameAR : item.productNameFR}</div>
                     <div className="text-muted-foreground text-xs">{item.quantity} x {item.unitPrice} {t('common.currency')}</div>
                   </div>
                   <div className="font-bold">{item.quantity * item.unitPrice} {t('common.currency')}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-card border rounded-xl p-6 relative">
             <h2 className="text-xl font-bold mb-4">{t('checkout.order_summary')}</h2>
             <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between">
                   <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                   <span>{order.total - 800} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">{language === 'ar' ? 'التوصيل' : 'Livraison'}</span>
                   <span>800 {t('common.currency')}</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-bold text-lg">
                   <span>Total</span>
                   <span className="text-primary">{order.total} {t('common.currency')}</span>
                </div>
             </div>
             
             <div className={`p-3 rounded-md text-center font-bold text-sm ${
               order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
             }`}>
               {order.paymentStatus === 'paid' 
                 ? (language === 'ar' ? 'تم الدفع بالكامل' : 'Payé en totalité')
                 : (language === 'ar' ? 'الدفع عند الاستلام (غير مدفوع بعد)' : 'Paiement à la livraison (Non payé)')}
             </div>
          </div>
          
          {invoice?.pdf_url ? (
            <Link href={invoice.pdf_url} target="_blank" className="w-full">
              <Button variant="outline" className="w-full gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                <FileText className="w-4 h-4" />
                {language === 'ar' ? 'عرض الفاتورة' : 'Voir la facture'}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="w-full gap-2">
              <FileText className="w-4 h-4" />
              {language === 'ar' ? 'الفاتورة غير متوفرة بعد' : 'Facture non disponible'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
