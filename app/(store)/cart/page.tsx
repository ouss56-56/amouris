"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, cartTotal } = useCartStore();
  const { t, language } = useI18n();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md flex flex-col items-center">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4">{t('cart.empty')}</h2>
        <Link href="/shop" className="w-full">
          <Button size="lg" className="w-full">{t('cart.continue_shopping')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">{t('cart.title')}</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card border rounded-xl p-4">
              <div className="relative w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                <Image src={item.image} alt={item.nameFR} fill className="object-cover" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold">{language === 'ar' ? item.nameAR : item.nameFR}</h3>
                {item.variantDescriptionLabel && (
                  <p className="text-sm text-muted-foreground">{item.variantDescriptionLabel}</p>
                )}
                <div className="text-primary font-semibold mt-1">
                  {item.unitPrice} {t('common.currency')}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - (item.variantDescriptionLabel ? 1 : 50)))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + (item.variantDescriptionLabel ? 1 : 50))}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="font-bold w-24 text-right">
                  {item.quantity * item.unitPrice} {t('common.currency')}
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.cartItemId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-secondary/30 rounded-xl p-6 border sticky top-24">
            <h2 className="text-xl font-bold mb-6">{t('checkout.order_summary')}</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium">{cartTotal()} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{language === 'ar' ? 'التوصيل' : 'Livraison'}</span>
                <span>{language === 'ar' ? 'يحسب في الخطوة التالية' : 'Calculé à la prochaine étape'}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{cartTotal()} {t('common.currency')}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button size="lg" className="w-full text-lg h-14">
                {t('cart.checkout')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
