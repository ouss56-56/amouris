"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useOrdersStore, Order } from '@/store/orders.store';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, ArrowRight, UserPlus, Home } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useI18n();
  const { orders } = useOrdersStore();
  const [order, setOrder] = useState<Order | null>(null);

  const orderNumber = searchParams.get('order');
  const isAr = language === 'ar';

  useEffect(() => {
    if (orderNumber) {
      const found = orders.find(o => o.order_number === orderNumber);
      if (found) {
        setOrder(found);
      }
    } else {
      router.push('/shop');
    }
  }, [orderNumber, orders, router]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 md:py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-950/5 border border-emerald-950/5 overflow-hidden">
          
          {/* Header */}
          <div className="bg-emerald-900 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8 relative z-10"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h1 className="font-serif text-3xl md:text-4xl text-white mb-4 relative z-10">
              {isAr ? 'تم تأكيد طلبك !' : 'Commande confirmée !'}
            </h1>
            <p className="text-emerald-100/60 font-black uppercase tracking-[0.3em] text-[10px] relative z-10">
              {isAr ? 'شكرا لثقتكم' : 'Merci pour votre confiance'}
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            
            {/* Order Number */}
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 mb-2">
                {isAr ? 'رقم الطلبية' : 'Numéro de commande'}
              </p>
              <h2 className="font-serif text-5xl text-emerald-950 tracking-tighter">
                {order.order_number}
              </h2>
            </div>

            <div className="h-px bg-emerald-950/5" />

            {/* Summary */}
            <div className="space-y-6">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <Package size={18} className="text-emerald-600" />
                {isAr ? 'ملخص الطلبية' : 'Récapitulatif Articles'}
              </h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-emerald-950 font-medium">
                      {isAr ? item.product_name_ar : item.product_name_fr}
                      <span className="text-[10px] text-emerald-900/40 ml-2 uppercase tracking-widest">
                        {item.product_type === 'perfume' ? `${item.quantity_grams}g` : `${item.quantity_units}x ${item.variant_label}`}
                      </span>
                    </span>
                    <span className="font-bold text-emerald-950">{item.total_price.toLocaleString()} DZD</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-emerald-950/5 flex justify-between items-end">
                   <span className="font-serif text-lg text-emerald-950">{isAr ? 'المجموع' : 'Total'}</span>
                   <span className="font-serif text-2xl text-emerald-600 font-bold">{order.total_amount.toLocaleString()} DZD</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-neutral-50 p-6 rounded-2xl border border-emerald-950/5">
               <h3 className="font-bold text-emerald-950 flex items-center gap-2 mb-4">
                  <Truck size={18} className="text-emerald-600" />
                  {isAr ? 'معلومات التوصيل' : 'Informations de livraison'}
               </h3>
               <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-emerald-900/40 uppercase tracking-widest font-black text-[9px] mb-1">{isAr ? 'الاسم' : 'Destinataire'}</p>
                    <p className="font-bold text-emerald-950">
                      {order.is_registered_customer ? 'Client enregistré' : `${order.guest_first_name} ${order.guest_last_name}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-900/40 uppercase tracking-widest font-black text-[9px] mb-1">{isAr ? 'الهاتف' : 'Téléphone'}</p>
                    <p className="font-bold text-emerald-950">{order.guest_phone || 'Voir profil'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-emerald-900/40 uppercase tracking-widest font-black text-[9px] mb-1">{isAr ? 'الولاية' : 'Wilaya'}</p>
                    <p className="font-bold text-emerald-950">
                      {order.guest_wilaya || 'Voir profil'} {order.guest_commune ? `(${order.guest_commune})` : ''}
                    </p>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center">
               <p className="text-xs font-bold text-amber-900">
                 {isAr ? 'سيتواصل معك مستشار أموريس لتأكيد التوصيل.' : 'Vous serez contacté(e) par un conseiller pour confirmer la livraison.'}
               </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.is_registered_customer ? (
                <Link href={`/account/orders/${order.id}`} className="w-full">
                  <button className="w-full h-14 bg-emerald-950 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#C9A84C] transition-all">
                    {isAr ? 'تتبع طلبي' : 'Suivre ma commande'}
                    <ArrowRight size={14} />
                  </button>
                </Link>
              ) : (
                <div className="space-y-4 md:col-span-2">
                   <div className="p-6 border-2 border-dashed border-emerald-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                          <UserPlus size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-emerald-950 text-sm">{isAr ? 'أنشئ حساباً' : 'Créez un compte'}</p>
                          <p className="text-xs text-emerald-900/40">{isAr ? 'لتتبع جميع طلباتك وتحميل فواتيرك' : 'Pour suivre vos commandes et télécharger vos factures'}</p>
                        </div>
                      </div>
                      <Link href="/register">
                        <button className="bg-emerald-100 text-emerald-900 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-200 transition-colors">
                          {isAr ? 'التسجيل الآن' : "S'inscrire"}
                        </button>
                      </Link>
                   </div>
                   <div className="p-4 bg-emerald-50 text-emerald-950/40 text-[10px] font-bold text-center uppercase tracking-widest rounded-xl">
                      {isAr ? `يرجى ملاحظة رقم الطلب: ${order.order_number}` : `Notez bien votre numéro de commande : ${order.order_number}`}
                   </div>
                </div>
              )}
              
              <Link href="/" className={order.is_registered_customer ? "w-full" : "w-full md:col-span-2"}>
                <button className="w-full h-14 bg-white border border-emerald-950/10 text-emerald-950 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all">
                  <Home size={14} />
                  {isAr ? 'العودة للمتجر' : 'Retour à la boutique'}
                </button>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
