"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateGrams, updateUnits, getTotal } = useCartStore();
  const { t, language } = useI18n();
  const isAr = language === 'ar';

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center min-h-[60vh] justify-center">
        <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-16 h-16 text-emerald-900/20" strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-serif text-emerald-950 mb-4">Votre panier est vide</h2>
        <p className="text-emerald-950/40 text-lg mb-10 italic">Découvrez nos essences d'exception.</p>
        <Link href="/shop" className="bg-[#0a3d2e] text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl shadow-emerald-900/20">
          Explorer la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 md:py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="mb-16">
          <h1 className="font-serif text-4xl md:text-6xl text-emerald-950 mb-4">{isAr ? 'حقيبة التسوق' : 'Votre Panier'}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">
            {items.length} {isAr ? 'منتج' : 'Articles sélectionnés'}
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const isPerfume = item.product_type === 'perfume';
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white border border-emerald-950/5 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all group"
                  >
                    <div className="w-24 h-24 bg-neutral-100 rounded-3xl flex items-center justify-center shrink-0 border border-emerald-950/5 text-emerald-950/10 font-serif text-4xl select-none group-hover:bg-emerald-50 group-hover:text-[#0a3d2e] transition-colors">
                      {item.name_fr.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
                      <div className="mb-4 sm:mb-0 relative pr-8">
                        <h3 className="font-serif text-xl text-emerald-950 truncate mb-1">
                          {isAr ? item.name_ar : item.name_fr}
                        </h3>
                        {item.variant_label && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C]">
                            {item.variant_label}
                          </p>
                        )}
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="absolute right-0 top-0 p-2 text-emerald-950/20 hover:text-rose-500 transition-colors sm:hidden"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-neutral-50 rounded-2xl p-1 border border-emerald-950/5">
                          <button 
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl text-emerald-950 transition-colors shadow-sm"
                            onClick={() => isPerfume ? updateGrams(item.id, (item.quantity_grams || 0) - 50) : updateUnits(item.id, (item.quantity_units || 0) - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-16 text-center text-sm font-bold text-emerald-950">
                             {isPerfume ? `${item.quantity_grams}g` : item.quantity_units}
                          </span>
                          <button 
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl text-emerald-950 transition-colors shadow-sm"
                            onClick={() => isPerfume ? updateGrams(item.id, (item.quantity_grams || 0) + 50) : updateUnits(item.id, (item.quantity_units || 0) + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right flex items-center gap-6">
                           <div className="hidden sm:block">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 mb-1">Total Ligne</p>
                             <p className="font-bold text-emerald-950">{item.total_price.toLocaleString()} DZD</p>
                           </div>
                           <button 
                             onClick={() => removeItem(item.id)}
                             className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl border border-emerald-950/5 text-emerald-950/20 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#0a3d2e] rounded-[3rem] p-10 border border-[#0a3d2e] shadow-2xl shadow-emerald-900/20 sticky top-32 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-serif mb-8 pb-6 border-b border-white/10">{isAr ? 'ملخص الطلب' : 'Récapitulatif'}</h2>
                
                <div className="space-y-6 mb-8 text-sm">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-100/40">
                    <span>{isAr ? 'المجموع الفرعي' : 'Sous-total'}</span>
                    <span className="text-white text-base">{getTotal().toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-100/40">
                    <span>{isAr ? 'التوصيل' : 'Livraison'}</span>
                    <span className="text-[#C9A84C]">{isAr ? 'يحسب في الخطوة الدفع' : 'Calculé au paiement'}</span>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 mb-10">
                  <div className="flex justify-between items-end">
                     <span className="font-serif text-xl">{isAr ? 'المجموع' : 'Total'}</span>
                     <div className="text-right">
                        <span className="font-serif text-4xl text-[#C9A84C] tracking-tighter">{getTotal().toLocaleString()}</span>
                        <span className="text-sm font-normal ml-2 italic">DZD</span>
                     </div>
                  </div>
                </div>

                <Link href="/checkout" className="block w-full">
                  <button className="w-full h-16 bg-white text-[#0a3d2e] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#C9A84C] hover:text-emerald-950 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3">
                    {isAr ? 'إتمام الطلب' : 'Passer à la caisse'}
                  </button>
                </Link>
                
                <p className="mt-8 text-center text-[9px] font-black uppercase tracking-widest text-white/20">
                  Paiement sécurisé à la livraison. Satisfait ou remboursé.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
