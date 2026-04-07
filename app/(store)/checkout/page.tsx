"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOrder } from '@/lib/actions/orders';
import { toast } from 'sonner';
import { WilayaSelector } from '@/components/store/WilayaSelector';
import { ShieldCheck, Truck, CreditCard, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { items, cartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phoneNumber || '',
    wilaya: user?.wilaya || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wilaya) {
      toast.error(language === 'ar' ? 'يرجى اختيار الولاية' : 'Veuillez choisir la wilaya');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderTotal = cartTotal() + 800; // Fixed shipping for now
      
      const order = await createOrder({
        customerId: user?.id || 'guest',
        guestInfo: !user ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
          wilaya: formData.wilaya,
        } : undefined,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productNameFR: item.nameFR,
          productNameAR: item.nameAR,
          type: item.variantId ? 'flacon' : 'perfume',
        })),
        total: orderTotal,
      });

      if (order) {
        clearCart();
        toast.success(language === 'ar' ? 'تم تقديم طلبك بنجاح' : 'Votre commande a été passée avec succès');
        router.push(`/checkout/success?id=${order.id}`);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(language === 'ar' ? 'فشل تقديم الطلب' : 'Échec de la commande: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-8 text-emerald-800">
          <Link href="/cart" className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
            {language === 'ar' ? 'العودة للسلة' : 'Retour au panier'}
          </Link>
          <span className="opacity-30">/</span>
          <h1 className="text-2xl font-serif">{t('checkout.title')}</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Form */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 space-y-8"
          >
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="bg-white border-0 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-serif text-emerald-950 mb-6 flex items-center gap-3">
                  <MapPin className="text-amber-500" size={20} />
                  {language === 'ar' ? 'معلومات التوصيل' : 'Informations de livraison'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      {t('checkout.first_name')} *
                    </Label>
                    <Input 
                      id="firstName" 
                      required 
                      className="rounded-none border-neutral-100 h-14 focus-visible:ring-emerald-800 focus-visible:border-emerald-800 transition-all font-medium"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      {t('checkout.last_name')} *
                    </Label>
                    <Input 
                      id="lastName" 
                      required 
                      className="rounded-none border-neutral-100 h-14 focus-visible:ring-emerald-800 focus-visible:border-emerald-800 transition-all font-medium"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      {t('checkout.phone')} *
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      dir="ltr"
                      inputMode="tel"
                      required 
                      placeholder="05 / 06 / 07 ..."
                      className="rounded-none border-neutral-100 h-14 focus-visible:ring-emerald-800 focus-visible:border-emerald-800 transition-all font-medium text-lg"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wilaya" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      {t('checkout.wilaya')} *
                    </Label>
                    <WilayaSelector 
                      value={formData.wilaya}
                      onValueChange={(val) => setFormData({...formData, wilaya: val})}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white border-0 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-serif text-emerald-950 mb-6 flex items-center gap-3">
                  <CreditCard className="text-amber-500" size={20} />
                  {t('checkout.payment_method')}
                </h2>
                <div className="p-5 border-2 border-emerald-800 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-4 border-emerald-800" />
                    <span className="font-medium text-lg text-emerald-950">{t('checkout.cash_on_delivery')}</span>
                  </div>
                  <ShieldCheck className="text-emerald-800" size={24} />
                </div>
              </motion.div>
            </form>
          </motion.div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[400px]">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-950 text-white rounded-none p-6 md:p-8 sticky top-24"
            >
              <h2 className="text-xl font-serif text-amber-400 mb-8 pb-4 border-b border-white/10">
                {t('checkout.order_summary')}
              </h2>
              
              <div className="space-y-6 mb-8 max-h-[35vh] overflow-y-auto pr-2 no-scrollbar">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {item.quantity}{item.variantId ? 'x' : 'g'} {language === 'ar' ? item.nameAR : item.nameFR}
                      </span>
                      {item.variantDescriptionLabel && (
                        <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                          {item.variantDescriptionLabel}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-amber-200 font-medium text-sm">
                      {(item.quantity * item.unitPrice).toLocaleString()} DZD
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-white/10 space-y-4 mb-10">
                <div className="flex justify-between text-sm text-white/60 font-light">
                  <span>{t('cart.subtotal')}</span>
                  <span>{cartTotal().toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-sm text-white/60 font-light">
                  <span className="flex items-center gap-2">
                    <Truck size={14} className="text-amber-400/50" />
                    {language === 'ar' ? 'التوصيل' : 'Livraison'} (Yalidine)
                  </span>
                  <span>{formData.wilaya ? `800 DZD` : '---'}</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-white pt-4 border-t border-white/10">
                  <span>TOTAL</span>
                  <span className="text-amber-400">
                    {(cartTotal() + (formData.wilaya ? 800 : 0)).toLocaleString()} DZD
                  </span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full text-base h-16 rounded-none bg-amber-400 text-emerald-950 font-bold uppercase tracking-[0.2em] hover:bg-amber-300 transition-all active:scale-[0.98] disabled:bg-white/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.loading') : t('checkout.confirm_order')}
              </Button>
              
              <p className="text-[10px] text-white/40 text-center mt-6 uppercase tracking-widest">
                Paiement sécurisé à la livraison
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
