"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/i18n-context';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, language } = useI18n();
  
  const name = language === 'ar' ? product.nameAR : product.nameFR;
  const isPerfume = product.type === 'perfume';
  
  const priceDisplay = isPerfume 
    ? `${product.pricePerGram} ${t('common.currency')} / ${t('product.grams')}`
    : `${product.variants[0]?.price} ${t('common.currency')}`;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/product/${product.id}`} className="group block h-full">
        <div className="bg-card rounded-xl border border-transparent hover:border-primary/20 hover:shadow-luxury transition-all duration-300 overflow-hidden h-full flex flex-col relative">
          
          {/* Best Seller or Status Badge */}
          {product.tagIds?.includes('bestseller') && (
            <div className="absolute top-3 left-3 z-10 rtl:left-auto rtl:right-3">
              <Badge className="bg-primary/90 backdrop-blur-sm shadow-sm hover:bg-primary">
                {language === 'ar' ? 'الأكثر مبيعاً' : 'Meilleure vente'}
              </Badge>
            </div>
          )}

          {/* Image Container with scale hover */}
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Image 
              src={product.images[0]} 
              alt={name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Subtle dark gradient overlay on hover for luxury feel */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
          </div>
          
          <div className="p-5 flex flex-col flex-grow">
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              {isPerfume ? t('product.perfume_oil') : t('product.flacon')}
            </div>
            <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="mt-auto pt-4 flex items-center justify-between">
              <span className="font-bold text-lg text-primary text-gold-gradient animate-shimmer">
                {priceDisplay}
              </span>
              <span className="text-sm font-medium text-muted-foreground opacity-0 -translate-x-2 rtl:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                {t('product.view_details')} &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
