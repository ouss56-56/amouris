"use client";

import { useI18n } from '@/i18n/i18n-context';
import { Order } from '@/store/orders.store';
import { Printer, Download, Receipt, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateInvoicePDF } from '@/lib/utils/invoice-generator';

interface OrderInvoiceProps {
  order: Order | any;
  settings: any;
}

export default function OrderInvoice({ order, settings }: OrderInvoiceProps) {
  const { language } = useI18n();
  const isAr = language === 'ar';

  const invoice = order.invoice_data || order; // Fallback to order if invoice_data is not present
  if (!invoice) return null;

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 max-w-4xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50" />
      
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 border-b border-emerald-950/5 pb-12 mb-12">
        <div className="space-y-4">
          <h1 className="font-serif text-3xl text-emerald-950 font-bold uppercase tracking-tighter">
            {settings?.storeNameFR || invoice.shop_name || 'AMOURIS PARFUMS'}
          </h1>
          <div className="space-y-1 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-amber-500" />
              <span>{settings?.address || invoice.shop_address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-amber-500" />
              <span>{settings?.phone || invoice.shop_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-amber-500" />
              <span>{settings?.email || invoice.shop_email}</span>
            </div>
          </div>
        </div>

        <div className="text-start md:text-right space-y-2">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            {isAr ? 'فاتورة' : 'FACTURE'}
          </div>
          <h2 className="text-2xl font-serif text-emerald-950">{invoice.invoice_number || `FAC-${order.id?.slice(0, 8).toUpperCase()}`}</h2>
          <p className="text-xs text-gray-400 font-medium">{isAr ? 'التاريخ:' : 'Date:'} {new Date(invoice.generated_at || order.created_at).toLocaleDateString()}</p>
          <p className="text-xs text-gray-400 font-medium">{isAr ? 'رقم الطلب:' : 'Commande:'} {invoice.order_number || order.order_number}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 relative z-10">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C] mb-4">
            {isAr ? 'الفاتورة موجهة إلى:' : 'Facturer à :'}
          </h3>
          <div className="space-y-1">
            <p className="font-serif text-xl text-emerald-950">{invoice.client_name || `${order.guest_first_name} ${order.guest_last_name}`}</p>
            {(invoice.client_shop || order.customer?.shop_name) && <p className="text-sm text-emerald-900/60 font-bold">{invoice.client_shop || order.customer?.shop_name}</p>}
            <p className="text-sm text-gray-500">{invoice.client_phone || order.guest_phone}</p>
            <p className="text-sm text-gray-500">{invoice.client_wilaya || order.guest_wilaya} {invoice.client_commune || order.guest_commune ? `- ${invoice.client_commune || order.guest_commune}` : ''}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="relative z-10 mb-12 border border-emerald-950/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-[10px] font-black uppercase tracking-widest text-emerald-950/40 border-b border-emerald-950/5">
              <th className="px-6 py-4">{isAr ? 'الوصف' : 'Description'}</th>
              <th className="px-6 py-4 text-center">{isAr ? 'الكمية' : 'Qté'}</th>
              <th className="px-6 py-4 text-right">{isAr ? 'السعر الوحدوي' : 'P.U'}</th>
              <th className="px-6 py-4 text-right">{isAr ? 'المجموع' : 'Total'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-950/5">
            {(invoice.items || order.items).map((item: any, i: number) => (
              <tr key={i} className="text-sm text-emerald-950">
                <td className="px-6 py-4 font-medium">{item.description || (isAr ? item.product_name_ar : item.product_name_fr)}</td>
                <td className="px-6 py-4 text-center">{item.quantity || (item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units}u`)}</td>
                <td className="px-6 py-4 text-right font-medium">{(item.unit_price || 0).toLocaleString()} DZD</td>
                <td className="px-6 py-4 text-right font-bold">{(item.total || item.total_price || 0).toLocaleString()} DZD</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="relative z-10 flex flex-col items-end gap-6 border-t border-emerald-950/5 pt-12">
        <div className="w-full md:w-80 space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-400 font-black uppercase tracking-widest">
            <span>{isAr ? 'المجموع الفرعي' : 'Sous-total'}</span>
            <span>{(invoice.subtotal || order.total_amount || 0).toLocaleString()} DZD</span>
          </div>
          <div className="flex justify-between items-end border-t border-emerald-950/5 pt-4">
            <span className="font-serif text-xl text-emerald-950">{isAr ? 'الإجمالي' : 'TOTAL'}</span>
            <span className="font-serif text-3xl text-emerald-900">{(invoice.total || order.total_amount || 0).toLocaleString()} <span className="text-sm font-sans">DZD</span></span>
          </div>
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-xs text-emerald-600 font-bold">
              <span>{isAr ? 'المبلغ المدفوع' : 'Montant payé'}</span>
              <span>{(invoice.amount_paid || order.amount_paid || 0).toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between text-sm text-amber-600 font-black border-t border-emerald-950/5 pt-2">
              <span>{isAr ? 'المبلغ المتبقي' : 'Reste à payer'}</span>
              <span>{((invoice.total || order.total_amount || 0) - (invoice.amount_paid || order.amount_paid || 0)).toLocaleString()} DZD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-emerald-950/5 text-center">
        <p className="text-xs text-gray-400 italic">
          {isAr ? 'شكراً لثقتكم بنا. نرجو أن تنال منتجاتنا إعجابكم.' : 'Merci pour votre confiance. Nous espérons que vous apprécierez nos produits.'}
        </p>
      </div>

      {/* Action Bar - Hidden during print */}
      <div className="mt-12 flex justify-center gap-4 print:hidden">
        <Button 
          variant="outline" 
          className="rounded-xl border-emerald-950/10"
          onClick={() => window.print()}
        >
          <Printer size={16} className="mr-2" />
          {isAr ? 'طباعة' : 'Imprimer'}
        </Button>
        <Button 
          className="rounded-xl bg-emerald-900 hover:bg-emerald-800"
          onClick={() => generateInvoicePDF(order, settings)}
        >
          <Download size={16} className="mr-2" />
          {isAr ? 'تحميل PDF' : 'Télécharger PDF'}
        </Button>
      </div>
    </div>
  );
}
