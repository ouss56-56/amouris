"use client";

import { useMemo, useState, useEffect } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { useCartStore } from '@/store/cart.store';
import { useCustomerAuthStore } from '@/store/customer-auth.store';
import { useOrdersStore, OrderItem } from '@/store/orders.store';
import { WilayaSelector } from '@/components/store/WilayaSelector';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, CheckCircle, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutClient() {
  const router = useRouter();
  const { language } = useI18n();
  const { items, getTotal, clear } = useCartStore();
  const { customer, isAuthenticated } = useCustomerAuthStore();
  const { createOrder } = useOrdersStore();

  const isAr = language === 'ar';
  const totalAmount = getTotal();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilaya: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.push('/shop');
    }
  }, [items, router, isSubmitting]);

  const handleConfirm = async () => {
    // Validation for guest
    if (!isAuthenticated && (!formData.firstName || !formData.lastName || !formData.phone || !formData.wilaya)) {
      alert(isAr ? 'يرجى ملء جميع الحقول الضرورية' : 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    // Validation for authenticated user
    if (isAuthenticated && (!customer?.firstName || !customer?.lastName || !customer?.phoneNumber || !customer?.wilaya)) {
      alert(isAr ? 'يرجى استكمال معلومات ملفك الشخصي قبل الطلب' : 'Veuillez compléter votre profil avant de commander.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map(i => ({
        product_id: i.product_id,
        flacon_variant_id: i.flacon_variant_id || null,
        product_name_fr: i.name_fr,
        product_name_ar: i.name_ar,
        quantity_grams: i.quantity_grams || null,
        quantity_units: i.quantity_units || null,
        unit_price: i.unit_price,
        total_price: i.total_price
      }));

      const order = await createOrder({
        customer_id: isAuthenticated ? customer!.id : null,
        guest_first_name: !isAuthenticated ? formData.firstName : undefined,
        guest_last_name: !isAuthenticated ? formData.lastName : undefined,
        guest_phone: !isAuthenticated ? formData.phone : undefined,
        guest_wilaya: !isAuthenticated ? formData.wilaya : undefined,
        items: orderItems,
        total_amount: totalAmount,
        order_status: 'pending'
      });

      clear();
      router.push(`/checkout/success?order=${order.order_number}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      alert(isAr ? 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.' : 'Échec de la création de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) return null;

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 md:py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <header className="mb-16">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/20 mb-4">
            <Link href="/shop" className="hover:text-emerald-950 transition-colors">Boutique</Link>
            <ChevronRight size={12} />
            <span className="text-emerald-950 font-black">Finaliser la commande</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-emerald-950">Confirmation</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Form */}
          <div className="lg:col-span-7 space-y-12">
            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-950/5 border border-emerald-950/5">
              <div className="flex items-center gap-4 mb-10 border-b border-emerald-950/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0a3d2e]">
                   <Truck size={24} />
                </div>
                <div>
                   <h2 className="font-serif text-2xl text-emerald-950">{isAr ? 'معلومات التوصيل' : 'Informations de livraison'}</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">Où devons-nous envoyer vos trésors ?</p>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 p-6 rounded-2xl border border-emerald-950/5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 mb-1">{isAr ? 'الاسم الشخصي' : 'Prénom'}</p>
                      <p className="font-medium text-emerald-950">{customer?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 mb-1">{isAr ? 'الاسم العائلي' : 'Nom'}</p>
                      <p className="font-medium text-emerald-950">{customer?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 mb-1">{isAr ? 'رقم الهاتف' : 'Numéro de téléphone'}</p>
                      <p className="font-medium text-emerald-950">{customer?.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 mb-1">{isAr ? 'الولاية' : 'Wilaya'}</p>
                      <p className="font-medium text-emerald-950">{customer?.wilaya}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link href="/account/settings" className="text-xs font-bold text-[#C9A84C] hover:text-emerald-950 transition-colors uppercase tracking-widest">
                      {isAr ? 'تعديل في ملفي الشخصي' : 'Modifier dans mon profil'}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">{isAr ? 'الاسم الشخصي' : 'Prénom'}</label>
                    <input 
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none focus:border-[#C9A84C] transition-colors font-medium text-emerald-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">{isAr ? 'الاسم العائلي' : 'Nom'}</label>
                    <input 
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none focus:border-[#C9A84C] transition-colors font-medium text-emerald-950"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">{isAr ? 'رقم الهاتف' : 'Numéro de téléphone'}</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none focus:border-[#C9A84C] transition-colors font-medium text-emerald-950"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">{isAr ? 'الولاية' : 'Wilaya'}</label>
                    <WilayaSelector value={formData.wilaya} onValueChange={val => setFormData({ ...formData, wilaya: val })} />
                  </div>
                </div>
              )}
            </section>

            <div className="flex items-start gap-4 p-8 bg-amber-50 rounded-3xl border border-amber-200/50">
               <ShieldCheck className="text-[#C9A84C] shrink-0" size={24} />
               <div>
                  <h4 className="font-bold text-amber-900 text-sm mb-1">{isAr ? 'دفع آمن عند الاستلام' : 'Paiement à la livraison 100% Sécurisé'}</h4>
                  <p className="text-amber-900/40 text-xs leading-relaxed">
                    Chez Amouris, vous payez uniquement lorsque vous recevez vos produits. Vérifiez votre colis à la réception pour une satisfaction totale.
                  </p>
               </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#0a3d2e] p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-950/20 sticky top-32 text-white overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

               <div className="relative z-10">
                 <h2 className="font-serif text-3xl mb-10 pb-6 border-b border-white/10">{isAr ? 'ملخص الطلبية' : 'Récapitulatif'}</h2>
                 
                 <div className="space-y-8 mb-12 max-h-[40vh] overflow-y-auto pr-4 no-scrollbar">
                   {items.map((item) => (
                     <div key={item.id} className="flex justify-between gap-4">
                       <div className="flex-1">
                          <p className="text-sm font-bold block truncate">{isAr ? item.name_ar : item.name_fr}</p>
                          <p className="text-[10px] text-emerald-100/40 uppercase tracking-widest mt-1">
                            {item.product_type === 'perfume' ? `${item.quantity_grams}g` : `${item.quantity_units}x ${item.variant_label}`}
                          </p>
                       </div>
                       <p className="text-sm font-bold shrink-0">{item.total_price.toLocaleString()} DZD</p>
                     </div>
                   ))}
                 </div>

                 <div className="space-y-4 pt-8 border-t border-white/10">
                   <div className="flex justify-between items-center text-xs text-emerald-100/40 uppercase tracking-widest font-black">
                      <span>{isAr ? 'المجموع الفرعي' : 'Sous-total'}</span>
                      <span>{totalAmount.toLocaleString()} DZD</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-emerald-100/40 uppercase tracking-widest font-black">
                      <span>{isAr ? 'تكاليف التوصيل' : 'Livraison'}</span>
                      <span className="text-amber-400 italic font-normal normal-case">Calculé à la confirmation</span>
                   </div>
                   <div className="h-px bg-white/10 my-4" />
                   <div className="flex justify-between items-end">
                      <span className="font-serif text-xl">{isAr ? 'المجموع النهائي' : 'Total Final'}</span>
                      <div className="text-right">
                         <p className="font-serif text-4xl text-amber-400 tracking-tighter">{totalAmount.toLocaleString()} <span className="text-sm font-normal italic">DZD</span></p>
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
                       {isAr ? 'تأكيد الطلبية' : 'Confirmer ma commande'}
                       <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </button>

                 <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.2em] text-white/20 leading-relaxed">
                    En cliquant, vous acceptez nos CGV.<br />
                    Un conseiller Amouris vous recontactera par téléphone.
                 </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
