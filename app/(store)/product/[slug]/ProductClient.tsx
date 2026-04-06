"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useI18n } from '@/i18n/i18n-context';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, FlaconVariant, Brand, Category } from '@/lib/types';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Gallery */}
        <div className="w-full md:w-1/2 md:sticky md:top-24 h-fit space-y-4">
          <div className="relative aspect-square bg-muted rounded-xl border overflow-hidden">
            <Image 
              src={selectedImage} 
              alt={name} 
              fill 
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-md border-2 overflow-hidden shrink-0 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {brand && <span>{language === 'ar' ? brand.nameAR : brand.nameFR}</span>}
            {brand && category && <span>•</span>}
            {category && <span>{language === 'ar' ? category.nameAR : category.nameFR}</span>}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{name}</h1>
          
          <div className="text-2xl font-bold text-primary mb-6">
             {totalPrice} {t('common.currency')}
             <span className="text-sm text-muted-foreground font-normal ml-2">
               {product.type === 'perfume' 
                 ? `(${product.pricePerGram} ${t('common.currency')} / 1g)` 
                 : ''}
             </span>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {description}
          </p>

          <div className="bg-secondary/40 p-6 rounded-xl border mb-8 flex flex-col gap-6">
            {product.type === 'perfume' ? (
              <div className="space-y-4">
                <label className="font-semibold">{t('product.quantity')} ({t('product.grams')})</label>
                <div className="flex items-center gap-4">
                  <div className="flex border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setGrams(Math.max(100, grams - 50))}
                      disabled={grams <= 100}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input 
                      type="number" 
                      value={grams} 
                      onChange={(e) => setGrams(Math.max(100, parseInt(e.target.value) || 100))}
                      className="w-20 border-0 text-center focus-visible:ring-0"
                      min={100}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setGrams(Math.min((product as any).stockInGrams || 100000, grams + 50))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {t('product.min_order')}: 100g
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-semibold">Variants / الأنواع</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <Button
                        key={v.id}
                        variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                        onClick={() => setSelectedVariant(v)}
                        className="flex-col items-start h-auto p-3"
                      >
                       <span className="font-bold">{v.size} - {v.color}</span>
                       <span className="text-xs opacity-80">{v.shape}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="font-semibold">{t('product.quantity')}</label>
                  <div className="flex items-center gap-4">
                    <div className="flex border rounded-md">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 border-0 text-center focus-visible:ring-0"
                        min={1}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                        disabled={quantity >= (selectedVariant?.stock || 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Max: {selectedVariant?.stock || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button size="lg" className="w-full text-lg h-14" onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
              {t('product.add_to_cart')}
            </Button>
          </div>

          <div className="pt-6 border-t space-y-4">
             <h3 className="font-bold">{t('product.details')}</h3>
             <ul className="list-disc list-inside text-muted-foreground space-y-2">
               <li>{language === 'ar' ? 'شحن سريع وموثوق' : 'Expédition rapide et fiable'}</li>
               <li>{language === 'ar' ? 'ضمان الجودة 100%' : 'Garantie de qualité 100%'}</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
