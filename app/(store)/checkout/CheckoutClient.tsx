"use client";

import { useMemo, useState, useEffect } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { useCartStore } from '@/store/cart.store';
import { useCustomerAuthStore } from '@/store/customer-auth.store';
import { useOrdersStore, OrderItem } from '@/store/orders.store';
import { useProductsStore } from '@/store/products.store';
import { WilayaSelector } from '@/components/store/WilayaSelector';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, CheckCircle, ArrowRight, ShieldCheck, Truck, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutClient() {
  const router = useRouter();
  const { t, language, dir } = useI18n();
  const { items, getTotal, clear } = useCartStore();
  const { currentCustomer, isAuthenticated } = useCustomerAuthStore();
  const { createOrder } = useOrdersStore();
  const { updateStockGrams, updateVariantStock } = useProductsStore();

  const isAr = language === 'ar';
  const isRtl = dir === 'rtl';
  const totalAmount = getTotal();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilaya: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);


  useEffect(() => {
    // Only redirect to shop if the cart is truly empty and we are NOT in the middle of a checkout
    // or haven't just successfully completed one.
    if (items.length === 0 && !isSubmitting && !isCompleted) {
      router.push('/shop');
    }
  }, [items, router, isSubmitting, isCompleted]);


  const handleConfirm = async () => {
    // Validation for guest
    if (!isAuthenticated && (!formData.firstName || !formData.lastName || !formData.phone || !formData.wilaya)) {
      alert(t('checkout.validation_error'));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map(i => ({
        product_id: i.product_id,
        product_type: i.product_type,
        flacon_variant_id: i.flacon_variant_id || null,
        product_name_fr: i.name_fr,
        product_name_ar: i.name_ar,
        variant_label: i.variant_label || null,
        quantity_grams: i.quantity_grams || null,
        quantity_units: i.quantity_units || null,
        unit_price: i.unit_price,
        total_price: i.total_price
      }));

      const orderData = {
        customer_id: isAuthenticated ? currentCustomer?.id : null,
        is_registered_customer: !!isAuthenticated,
        guest_first_name: !isAuthenticated ? formData.firstName : null,
        guest_last_name: !isAuthenticated ? formData.lastName : null,
        guest_phone: !isAuthenticated ? formData.phone : null,
        guest_wilaya: !isAuthenticated ? formData.wilaya : null,
        guest_commune: null,
        items: orderItems,
        total_amount: totalAmount,
      };

      const order = await createOrder(orderData);

      // Deduct stock
      for (const item of orderItems) {
        if (item.product_type === 'perfume' && item.quantity_grams) {
          updateStockGrams(item.product_id, -item.quantity_grams);
        } else if (item.product_type === 'flacon' && item.flacon_variant_id && item.quantity_units) {
          updateVariantStock(item.product_id, item.flacon_variant_id, -item.quantity_units);
        }
      }

      setIsCompleted(true);
      clear();
      router.push(`/checkout/success?order=${order.order_number}`);

    } catch (err) {
      console.error('Order creation failed:', err);
      alert(t('checkout.order_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) return null;

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 md:py-24" dir={dir}>
      <div className="container mx-auto px-6 max-w-7xl">
        
        <header className="mb-16 text-start">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
            <Link href="/shop" className="hover:text-emerald-950 transition-colors uppercase">{t('nav.shop')}</Link>
            <ChevronRight size={12} className="rtl:rotate-180" />
            <span className="text-gray-900 font-black uppercase">{t('checkout.title')}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-gray-900">{t('checkout.confirmation')}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Form */}
          <div className="lg:col-span-7 space-y-12">
            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-950/5 border border-emerald-950/5 text-start">
              <div className="flex items-center gap-4 mb-10 border-b border-emerald-950/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0a3d2e]">
                   <Truck size={24} />
                </div>
                <div>
                   <h2 className="font-serif text-2xl text-gray-900">{t('checkout.delivery_info')}</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('checkout.delivery_desc')}</p>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="space-y-6">
                  <div className="bg-neutral-50 p-8 rounded-[2rem] border border-emerald-950/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/40 mb-2">{t('checkout.full_name')}</p>
                        <p className="font-serif text-xl text-emerald-950">{currentCustomer?.first_name} {currentCustomer?.last_name}</p>
                      </div>
                      {currentCustomer?.shop_name && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/40 mb-2">{t('checkout.shop_name')}</p>
                          <p className="font-serif text-xl text-emerald-950">{currentCustomer?.shop_name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/40 mb-2">{t('checkout.phone')}</p>
                        <p className="font-medium text-emerald-950">{currentCustomer?.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/40 mb-2">{t('checkout.wilaya_commune')}</p>
                        <p className="font-medium text-emerald-950">{currentCustomer?.wilaya} {currentCustomer?.commune ? `/ ${currentCustomer.commune}` : ''}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end rtl:justify-start">
                    <Link href="/account/settings" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A84C] hover:text-emerald-950 transition-colors">
                      {t('checkout.edit_profile')}
                      <ArrowRight size={12} className={`${isRtl ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"} transition-transform`} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 block px-1">
                         {t('checkout.first_name')} <span className="text-rose-500">*</span>
                       </label>
                      <input 
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none focus:border-[#C9A84C] transition-colors font-medium text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 block px-1">
                         {t('checkout.last_name')} <span className="text-rose-500">*</span>
                       </label>
                      <input 
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none focus:border-[#C9A84C] transition-colors font-medium text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 block px-1">
                         {t('checkout.phone')} <span className="text-rose-500">*</span>
                       </label>
                      <input 
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none focus:border-[#C9A84C] transition-colors font-medium text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 block px-1">
                         {t('checkout.wilaya')} <span className="text-rose-500">*</span>
                       </label>
                      <WilayaSelector value={formData.wilaya} onValueChange={val => setFormData({ ...formData, wilaya: val })} />
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600">
                        <UserPlus size={20} />
                      </div>
                      <p className="text-xs text-emerald-900/70 font-medium">
                        {t('checkout.register_promo')}
                      </p>
                    </div>
                    <Link href="/register">
                      <button className="whitespace-nowrap text-xs font-bold text-emerald-600 hover:text-emerald-950 transition-colors uppercase tracking-widest">
                        {t('checkout.register_action')}
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-950/5 border border-emerald-950/5 text-start">
              <div className="flex items-center gap-4 mb-10 border-b border-emerald-950/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-[#C9A84C]">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h2 className="font-serif text-2xl text-gray-900">{t('checkout.payment_method')}</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('checkout.payment_desc')}</p>
                </div>
              </div>

              <div className="p-8 bg-neutral-50 rounded-3xl border border-emerald-950/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center text-white">
                    <CheckCircle size={20} />
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-emerald-950 text-sm">{t('checkout.cod')}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40">Cash on Delivery (COD)</p>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                  {t('checkout.confirmed')}
                </div>
              </div>
              
              <p className="mt-6 text-amber-900/60 text-xs leading-relaxed italic">
                {t('checkout.cod_desc')}
              </p>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#0a3d2e] p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-950/20 sticky top-32 text-white overflow-hidden text-start">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

               <div className="relative z-10">
                 <h2 className="font-serif text-3xl mb-10 pb-6 border-b border-white/10">{t('checkout.summary')}</h2>
                 
                 <div className="space-y-8 mb-12 max-h-[40vh] overflow-y-auto pr-4 no-scrollbar">
                   {items.map((item) => (
                     <div key={item.id} className="flex justify-between gap-4">
                       <div className="flex-1">
                          <p className="text-sm font-bold block truncate">{isAr ? item.name_ar : item.name_fr}</p>
                          <p className="text-[10px] text-emerald-100/60 uppercase tracking-widest mt-1">
                            {item.product_type === 'perfume' ? `${item.quantity_grams}g` : `${item.quantity_units}x ${item.variant_label}`}
                          </p>
                          <p className="text-[10px] text-emerald-100/40 mt-1">
                             {item.unit_price.toLocaleString()} {t('common.dzd')} / unit
                          </p>
                       </div>
                       <p className="text-sm font-bold shrink-0">{item.total_price.toLocaleString()} {t('common.dzd')}</p>
                     </div>
                   ))}
                 </div>

                 <div className="space-y-4 pt-8 border-t border-white/10">
                   <div className="flex justify-between items-center text-xs text-emerald-100/60 uppercase tracking-widest font-black">
                      <span>{t('checkout.subtotal')}</span>
                      <span>{totalAmount.toLocaleString()} {t('common.dzd')}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-emerald-100/40 uppercase tracking-widest font-black">
                      <span>{t('checkout.delivery_method')}</span>
                      <span className="text-amber-400 font-bold">{t('checkout.cod')}</span>
                   </div>
                   <div className="h-px bg-white/10 my-4" />
                   <div className="flex justify-between items-end">
                      <span className="font-serif text-xl">{t('checkout.total')}</span>
                      <div className="text-right rtl:text-left">
                         <p className="font-serif text-4xl text-emerald-400 tracking-tighter">{totalAmount.toLocaleString()} <span className="text-sm font-normal italic">{t('common.dzd')}</span></p>
                      </div>
                   </div>
                 </div>

                 <button 
                   onClick={handleConfirm}
                   disabled={isSubmitting}
                   className="w-full mt-12 bg-white text-[#0a3d2e] py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#C9A84C] hover:text-emerald-950 transition-all active:scale-95 shadow-2xl shadow-black/20 flex items-center justify-center gap-3 group"
                 >
                   {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                   ) : (
                      <>
                        {t('checkout.confirm_order')}
                        <ArrowRight size={16} className={`${isRtl ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"} transition-transform`} />
                      </>
                   )}
                 </button>

                  <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                    {t('checkout.terms_agree')}<br />
                    {t('checkout.contact_notice')}
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
