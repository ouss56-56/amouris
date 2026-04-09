'use client'
import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { useI18n } from '@/i18n/i18n-context'
import { useTagsStore } from '@/store/tags.store'
import { motion } from 'framer-motion'
import { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  index?: number
  compact?: boolean
}

export function ProductCard({ product, index = 0, compact = false }: ProductCardProps) {
  const { language } = useI18n()
  const tags = useTagsStore(s => s.tags)
  
  const name = language === 'ar' ? product.name_ar : product.name_fr
  const subName = language === 'ar' ? product.name_fr : product.name_ar
  const isPerfume = product.product_type === 'perfume'
  
  // Get tag info
  const firstTag = tags.find(tag => product.tag_ids?.includes(tag.id))
  const tagName = firstTag ? (language === 'ar' ? firstTag.name_ar : firstTag.name_fr) : null

  const displayPrice = isPerfume 
    ? product.price_per_gram
    : (product.variants && product.variants.length > 0)
      ? Math.min(...product.variants.map(v => v.price))
      : product.base_price || 0

  // Color swatches for flacons
  const colors = !isPerfume ? Array.from(new Set(product.variants?.map(v => v.color))).filter(Boolean) : []
  const maxColors = 4
  const visibleColors = colors.slice(0, maxColors)
  const remainingColors = colors.length - maxColors

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="h-full group"
    >
      <Link href={`/product/${product.slug}`} className="block relative h-full flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-1000 border border-transparent hover:border-emerald-100/50 rounded-xl sm:rounded-2xl">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/20 transition-all duration-1000 z-10" />
          
          <ProductImage 
            images={product.images} 
            productName={name} 
            categoryId={product.category_id} 
            productType={product.product_type}
            className="w-full h-full"
          />
          
          {/* Badge Tag */}
          {tagName && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
              <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black px-2 py-1 sm:px-4 sm:py-2 bg-[#0a3d2e] text-white rounded-full">
                {tagName}
              </span>
            </div>
          )}

          {/* Type Indicator */}
          <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-[#C9A84C] text-emerald-950 rounded-full">
                {isPerfume ? (language === 'ar' ? 'مجموعة عطرية' : 'Huile de Parfum') : (language === 'ar' ? 'كريستال' : 'Flacons d\'Elite')}
             </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 flex-1 flex flex-col items-center text-center">
          <div className="space-y-0.5 sm:space-y-1 mb-3 sm:mb-6">
            <h3 className="font-serif text-sm sm:text-xl text-gray-900 group-hover:text-emerald-800 transition-colors duration-500 line-clamp-2">
              {name}
            </h3>
            <p className="text-gray-500 text-[8px] sm:text-[10px] uppercase font-black tracking-[0.1em] sm:tracking-[0.2em] rtl:font-arabic hidden sm:block" dir={language === 'ar' ? 'ltr' : 'rtl'}>
              {subName}
            </p>
          </div>

          {!isPerfume && colors.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {visibleColors.map((color, i) => (
                <div 
                  key={i} 
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/5" 
                  style={{ backgroundColor: color as string }} 
                />
              ))}
              {remainingColors > 0 && (
                <span className="text-[7px] sm:text-[8px] font-black text-emerald-950/20">+{remainingColors}</span>
              )}
            </div>
          )}
          
          <div className="mt-auto w-full pt-2 sm:pt-4 border-t border-emerald-50 flex items-center justify-center gap-1 sm:gap-2">
            <span className="text-emerald-800 font-serif text-base sm:text-2xl tracking-tighter">
              {displayPrice?.toLocaleString()}
            </span>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">
              DZD {isPerfume ? '/ G' : ''}
            </span>
          </div>
        </div>

        {/* Hover Border Accent */}
        <div className="absolute bottom-0 left-0 h-1 bg-[#C9A84C] w-0 group-hover:w-full transition-all duration-1000" />
      </Link>
    </motion.div>
  )
}
