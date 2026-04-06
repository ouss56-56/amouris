"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { wilayas } from '@/lib/wilayas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createOrder } from '@/lib/actions/orders';
import { toast } from 'sonner';

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
    setIsSubmitting(true);
    
    try {
      const orderTotal = cartTotal() + (formData.wilaya ? 800 : 0);
      
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
          type: item.variantId ? 'flacon' : 'perfume', // simplified check
        })),
        total: orderTotal,
      });

      if (order) {
        clearCart();
        toast.success(language === 'ar' ? 'تم تقديم طلبك بنجاح' : 'Votre commande a été passée avec succès');
        router.push(`/checkout/success?id=${order.id}`);
      }
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast.error(language === 'ar' ? 'فشل تقديم الطلب' : 'Échec de la commande: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">{t('checkout.title')}</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4 bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold border-b pb-4 mb-4">
                {language === 'ar' ? 'معلومات التوصيل' : 'Informations de livraison'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('checkout.first_name')} *</Label>
                  <Input 
                    id="firstName" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('checkout.last_name')} *</Label>
                  <Input 
                    id="lastName" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  dir="ltr"
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wilaya">{t('checkout.wilaya')} *</Label>
                <Select 
                  required 
                  value={formData.wilaya} 
                  onValueChange={(val) => setFormData({...formData, wilaya: val})}
                >
                  <SelectTrigger className={language === 'ar' ? 'flex-row-reverse' : ''}>
                    <SelectValue placeholder={t('checkout.wilaya')} />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.map((w) => (
                      <SelectItem key={w.id} value={w.name}>
                        {w.id} - {language === 'ar' ? w.nameAR : w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold border-b pb-4 mb-4">
                {t('checkout.payment_method')}
              </h2>
              <div className="p-4 border rounded-md bg-secondary/20 flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />
                <span className="font-medium text-lg">{t('checkout.cash_on_delivery')}</span>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-secondary/30 rounded-xl p-6 border sticky top-24">
            <h2 className="text-xl font-bold mb-6">{t('checkout.order_summary')}</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">
                      {item.quantity}x {language === 'ar' ? item.nameAR : item.nameFR}
                    </span>
                    {item.variantDescriptionLabel && (
                      <span className="text-xs text-muted-foreground">{item.variantDescriptionLabel}</span>
                    )}
                  </div>
                  <span className="shrink-0">{item.quantity * item.unitPrice} {t('common.currency')}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('cart.subtotal')}</span>
                <span>{cartTotal()} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{language === 'ar' ? 'التوصيل' : 'Livraison'} (Yalidine)</span>
                <span>{formData.wilaya ? `800 ${t('common.currency')}` : '---'}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {cartTotal() + (formData.wilaya ? 800 : 0)} {t('common.currency')}
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              form="checkout-form" 
              className="w-full text-lg h-14"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('checkout.confirm_order')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

