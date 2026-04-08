"use client";

import { useSearchParams } from 'next/navigation';
import { useOrdersStore } from '@/store/orders.store';
import { useCustomerAuthStore } from '@/store/customer-auth.store';
import { useI18n } from '@/i18n/i18n-context';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Package, Truck, Phone } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { orders } = useOrdersStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const { language } = useI18n();
  const isAr = language === 'ar';

  const order = orders.find(o => o.order_number === orderNumber);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl text-emerald-950 mb-4">Commande introuvable</h1>
        <Link href="/shop" className="text-[#C9A84C] font-bold uppercase tracking-widest text-xs">Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-950/5 border border-emerald-950/5 overflow-hidden"
        >
          {/* Header Accent */}
          <div className="bg-[#0a3d2e] py-16 px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-[80px]" />
            </div>
            <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", damping: 12, delay: 0.2 }}
               className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20"
            >
              <CheckCircle size={40} className="text-amber-400" />
            </motion.div>
            <h1 className="font-serif text-3xl md:text-5xl text-white mb-2">
              {isAr ? 'شكراً لثقتكم في أموريس' : 'Merci pour votre confiance'}
            </h1>
            <p className="text-emerald-100/40 text-[10px] font-black uppercase tracking-[0.4em]">
              {isAr ? 'تم تسجيل طلبيتك بنجاح' : 'Votre commande a été enregistrée'}
            </p>
          </div>

          {/* Details */}
          <div className="p-8 md:p-12 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-emerald-950/5 pb-12">
               <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 mb-2">Numéro de commande</p>
                  <p className="font-serif text-3xl text-emerald-950 tracking-tight">{order.order_number}</p>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 mb-2">Total à régler (Cash)</p>
                  <p className="font-serif text-3xl text-[#C9A84C] tracking-tight">{order.total_amount.toLocaleString()} DZD</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0a3d2e] mx-auto md:mx-0">
                    <Package size={18} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-950">Préparation</h4>
                  <p className="text-xs text-emerald-950/40 leading-relaxed font-medium">Nos artisans préparent vos parfums avec soin.</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-[#C9A84C] mx-auto md:mx-0">
                    <Phone size={18} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-950">Confirmation</h4>
                  <p className="text-xs text-emerald-950/40 leading-relaxed font-medium">Un conseiller va vous appeler pour valider l'adresse.</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-900 mx-auto md:mx-0">
                    <Truck size={18} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-950">Livraison</h4>
                  <p className="text-xs text-emerald-950/40 leading-relaxed font-medium">Réception sous 48-72h dans toute l'Algérie.</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-emerald-950/5">
               {isAuthenticated ? (
                 <Link 
                   href={`/account/orders/${order.id}`}
                   className="flex-1 h-16 bg-[#0a3d2e] text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-emerald-900/10 gap-3 group"
                 >
                   {isAr ? 'عرض طلبيتي' : 'Voir ma commande'}
                   <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
               ) : (
                 <Link 
                   href="/register" 
                   className="flex-1 h-16 bg-[#0a3d2e] text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-emerald-900/10 gap-3 group px-4 text-center leading-relaxed"
                 >
                   {isAr ? 'إنشاء حساب لتتبع طلبياتك' : 'Créer un compte pour suivre'}
                   <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                 </Link>
               )}
               <Link 
                 href="/shop" 
                 className="flex-1 h-16 bg-white border border-emerald-950/5 text-emerald-950 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all font-bold"
               >
                 {isAr ? 'العودة للمتجر' : 'Continuer mes achats'}
               </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0a3d2e]"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
