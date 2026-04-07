"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useI18n } from '@/i18n/i18n-context';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, FlaconVariant, Brand, Category, PerfumeProduct } from '@/lib/types';

interface ProductClientProps {
  product: Product;
  brand?: Brand;
  category?: Category;
}

export default function ProductClient({ product, brand, category }: ProductClientProps) {
  const { t, language } = useI18n();
  const addItem = useCartStore((state) => state.addItem);
  
  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [grams, setGrams] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<FlaconVariant | null>(
    product.type === 'flacon' && product.variants.length > 0 ? product.variants[0] : null
  );

  const name = language === 'ar' ? product.nameAR : product.nameFR;
  const description = language === 'ar' ? product.descriptionAR : product.descriptionFR;

  const handleAddToCart = () => {
    if (product.type === 'perfume') {
      const stock = (product as PerfumeProduct).stockInGrams || 0;
      if (grams > stock) {
        toast.error(language === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون' : 'La quantité demandée dépasse le stock');
        return;
      }
      addItem({
        productId: product.id,
        quantity: grams,
        unitPrice: product.pricePerGram,
        productNameAR: product.nameAR,
        productNameFR: product.nameFR,
        nameAR: product.nameAR,
        nameFR: product.nameFR,
        image: product.images[0],
      });
      toast.success(language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Ajouté au panier');
    } else if (product.type === 'flacon' && selectedVariant) {
      if (quantity > (selectedVariant.stock || 0)) {
        toast.error(language === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون' : 'La quantité demandée dépasse le stock');
        return;
      }
      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: quantity,
        unitPrice: selectedVariant.price,
        productNameAR: product.nameAR,
        productNameFR: product.nameFR,
        nameAR: product.nameAR,
        nameFR: product.nameFR,
        image: product.images[0],
        variantDescriptionLabel: `${selectedVariant.size} - ${selectedVariant.color} - ${selectedVariant.shape}`
      });
      toast.success(language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Ajouté au panier');
    }
  };

  const totalPrice = product.type === 'perfume' 
    ? grams * product.pricePerGram
    : (selectedVariant?.price || 0) * quantity;

  const isPerfumeOutOfStock = product.type === 'perfume' && ((product as PerfumeProduct).stockInGrams || 0) <= 0;
  const isVariantOutOfStock = product.type === 'flacon' && (selectedVariant?.stock || 0) <= 0;
  const isCurrentlyUnavailable = isPerfumeOutOfStock || isVariantOutOfStock;

  return (
    <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="w-full md:w-1/2 md:sticky md:top-24 h-fit space-y-4">
          <div className="relative aspect-square bg-muted rounded-xl border overflow-hidden">
            <Image 
              src={selectedImage} 
              alt={name} 
              fill 
              priority
              className={`object-cover ${isCurrentlyUnavailable ? 'grayscale-[0.5]' : ''}`}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-md border-2 overflow-hidden shrink-0 transition-all ${selectedImage === img ? 'border-emerald-800 scale-95' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-[10px] md:text-xs text-emerald-700/60 uppercase tracking-[0.2em] font-bold">
            {brand && <span>{language === 'ar' ? brand.nameAR : brand.nameFR}</span>}
            {brand && category && <span>•</span>}
            {category && <span>{language === 'ar' ? category.nameAR : category.nameFR}</span>}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif text-emerald-950 mb-4 leading-tight">{name}</h1>
          
          <div className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-4">
             {totalPrice.toLocaleString()} {t('common.currency')}
             <span className="text-sm text-muted-foreground font-normal">
               {product.type === 'perfume' 
                 ? `(${product.pricePerGram} ${t('common.currency')} / 1g)` 
                 : ''}
             </span>
             {isCurrentlyUnavailable && (
               <span className="text-sm font-bold text-red-600 uppercase bg-red-100 px-3 py-1 rounded-none">
                 {language === 'ar' ? 'نفذت الكمية' : 'En rupture'}
               </span>
             )}
          </div>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 border-l-2 border-amber-400 pl-6 rtl:border-l-0 rtl:border-r-2 rtl:pr-6 font-light">
            {description}
          </p>

          <div className="bg-emerald-50/50 p-6 rounded-none border border-emerald-100 mb-8 flex flex-col gap-6">
            {product.type === 'perfume' ? (
              <div className="space-y-4">
                <label className="font-bold text-sm uppercase tracking-wider flex justify-between">
                  <span className="text-emerald-800 font-medium">
                    {((product as PerfumeProduct).stockInGrams || 0).toLocaleString()}g {language === 'ar' ? 'متوفر' : 'dispo.'}
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex border border-emerald-200 bg-white shadow-sm overflow-hidden rounded-none">
                    <Button 
                      variant="ghost" 
                      className="h-14 w-14 rounded-none hover:bg-emerald-50 text-emerald-900"
                      onClick={() => setGrams(Math.max(100, grams - 50))}
                      disabled={grams <= 100 || isPerfumeOutOfStock}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Input 
                      type="number" 
                      value={grams} 
                      onChange={(e) => setGrams(Math.max(100, Math.min((product as PerfumeProduct).stockInGrams || 100, parseInt(e.target.value) || 100)))}
                      className="w-24 h-14 border-0 text-center font-bold focus-visible:ring-0 text-lg rounded-none"
                      min={100}
                      disabled={isPerfumeOutOfStock}
                    />
                    <Button 
                      variant="ghost" 
                      className="h-14 w-14 rounded-none hover:bg-emerald-50 text-emerald-900"
                      onClick={() => setGrams(Math.min((product as PerfumeProduct).stockInGrams || 100, grams + 50))}
                      disabled={isPerfumeOutOfStock || grams >= ((product as PerfumeProduct).stockInGrams || 0)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium tracking-widest hidden sm:block">
                    {t('product.min_order')}: 100g
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-bold text-sm uppercase tracking-wider">Variantes disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <Button
                        key={v.id}
                        variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex-col items-start h-auto p-4 rounded-none transition-all border-emerald-100 ${v.stock === 0 ? 'opacity-30' : ''} ${selectedVariant?.id === v.id ? 'bg-emerald-800 border-emerald-800' : 'hover:bg-emerald-50'}`}
                      >
                       <span className="font-bold text-sm">{v.size} - {v.color}</span>
                       <span className="text-[10px] uppercase opacity-60 tracking-tighter">{v.shape}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="font-bold text-sm uppercase tracking-wider flex justify-between">
                    <span>{t('product.quantity')}</span>
                    <span className="text-emerald-800 font-medium">{(selectedVariant?.stock || 0)} {language === 'ar' ? 'في المخزون' : 'en stock'}</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex border border-emerald-200 bg-white shadow-sm overflow-hidden rounded-none">
                      <Button 
                        variant="ghost" 
                        className="h-14 w-14 rounded-none hover:bg-emerald-50 text-emerald-900"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isVariantOutOfStock}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <Input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, Math.min(selectedVariant?.stock || 1, parseInt(e.target.value) || 1)))}
                        className="w-20 h-14 border-0 text-center font-bold focus-visible:ring-0 text-lg rounded-none"
                        min={1}
                        disabled={isVariantOutOfStock}
                      />
                      <Button 
                        variant="ghost" 
                        className="h-14 w-14 rounded-none hover:bg-emerald-50 text-emerald-900"
                        onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                        disabled={isVariantOutOfStock || quantity >= (selectedVariant?.stock || 0)}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className={`w-full text-base h-14 font-bold rounded-none uppercase tracking-widest transition-all active:scale-[0.98] ${isCurrentlyUnavailable ? 'bg-gray-400' : 'bg-emerald-800 hover:bg-emerald-700 shadow-lg'}`} 
              onClick={handleAddToCart}
              disabled={isCurrentlyUnavailable}
            >
              <ShoppingBag className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
              {isCurrentlyUnavailable 
                ? (language === 'ar' ? 'نفذت الكمية' : 'Indisponible')
                : t('product.add_to_cart')
              }
            </Button>
          </div>

          <div className="pt-8 border-t border-emerald-50 space-y-6">
             <h3 className="font-serif text-xl text-emerald-950 uppercase tracking-wide">{t('product.details')}</h3>
             <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 font-light">
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-amber-400" />
                 {language === 'ar' ? 'شحن سريع وموثوق' : 'Expédition rapide et fiable'}
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-amber-400" />
                 {language === 'ar' ? 'ضمان الجودة 100%' : 'Garantie de qualité 100%'}
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-amber-400" />
                 {language === 'ar' ? 'منتجات أصلية' : 'Produits authentiques'}
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-amber-400" />
                 {language === 'ar' ? 'خدمة عملاء متميزة' : 'Support client dédié'}
               </li>
             </ul>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart for mobile */}
      {!isCurrentlyUnavailable && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 p-3 safe-area-pb translate-y-0 animate-in slide-in-from-bottom duration-500">
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-emerald-800 text-white h-14 font-medium text-lg rounded-none active:bg-emerald-900 transition-colors touch-manipulation"
          >
            {t('product.add_to_cart')} — {totalPrice.toLocaleString()} DZD
          </Button>
        </div>
      )}
    </div>
  );
}

