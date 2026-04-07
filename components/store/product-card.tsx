"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/i18n-context';
import { Product } from '@/lib/types';
import { tags as mockTags } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, language } = useI18n();
  
  const name = language === 'ar' ? product.nameAR : product.nameFR;
  const isPerfume = product.type === 'perfume';
  
  // Get the first tag's name if available
  const tag = mockTags.find(t => product.tagIds?.includes(t.id));
  const tagName = tag ? (language === 'ar' ? tag.nameAR : tag.nameFR) : null;

  const displayPrice = isPerfume 
    ? product.pricePerGram
    : Math.min(...(product.variants?.map(v => v.price) || [0]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/product/${product.id}`} className="group block relative bg-white border border-neutral-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 rounded-none overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden">
          <Image 
            src={product.images[0] || 'https://images.unsplash.com/photo-1594035910387-fea477262dc0?q=80&w=800'} 
            alt={name} 
            fill 
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          {/* Tag badge */}
          {tagName && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
              <span className={`text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] px-2 py-1 md:px-3 md:py-1.5 font-bold shadow-sm ${
                tag?.id === 't1' ? 'bg-emerald-800 text-white' : 
                tag?.id === 't2' ? 'bg-amber-400 text-emerald-950' : 
                'bg-rose-900 text-white'
              }`}>
                {tagName}
              </span>
            </div>
          )}

          {/* Hover overlay - Subtle */}
          <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/5 transition-colors duration-300" />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 hidden md:flex">
            <span className="bg-white text-emerald-950 text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 font-bold shadow-lg border border-emerald-50">
              {t('common.view_details')}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-[9px] md:text-[10px] text-amber-600 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2 font-bold opacity-80">
              {isPerfume ? (language === 'ar' ? 'عطر زيتي' : 'Huile de Parfum') : (language === 'ar' ? 'قارورة فاخرة' : 'Flacon de Luxe')}
            </p>
            <h3 className="font-serif text-base md:text-xl text-emerald-950 mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight md:tracking-normal leading-tight">
              {name}
            </h3>
          </div>
          
          <div className="pt-3 border-t border-neutral-50 flex flex-col">
            <p className="text-emerald-900 font-bold text-sm md:text-lg">
              {isPerfume ? `${displayPrice.toLocaleString()} DZD/g` : `Dès ${displayPrice.toLocaleString()} DZD`}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

