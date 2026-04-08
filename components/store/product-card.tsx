'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useI18n } from '@/i18n/i18n-context'
import { useTagsStore } from '@/store/tags.store'
import { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  index?: number
  compact?: boolean
}

export function ProductCard({ product, index = 0, compact = false }: ProductCardProps) {
  const { t, language } = useI18n()
  const tags = useTagsStore(s => s.tags)
  
  const name = language === 'ar' ? product.nameAR : product.nameFR
  const subName = language === 'ar' ? product.nameFR : product.nameAR
  const isPerfume = product.type === 'perfume'
  
  // Get tag info
  const firstTag = tags.find(tag => product.tagIds?.includes(tag.id))
  const tagName = firstTag ? (language === 'ar' ? firstTag.nameAR : firstTag.nameFR) : null

  const displayPrice = isPerfume 
    ? product.pricePerGram
    : Math.min(...(product.variants?.map(v => v.price) || [0]))

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="h-full group"
    >
      <Link href={`/product/${product.slug}`} className="block relative h-full flex flex-col bg-white overflow-hidden shadow-luxury hover:shadow-2xl transition-all duration-1000">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/20 transition-all duration-1000 z-10" />
          
          {product.images?.[0] ? (
            <Image 
              src={product.images[0]} 
              alt={name} 
              fill 
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50/50 to-amber-50/50">
                <span className="text-emerald-900/5 font-serif text-8xl md:text-9xl select-none group-hover:scale-110 transition-transform duration-1000">
                    {(product.nameFR || 'P').charAt(0)}
                </span>
            </div>
          )}
          
          {/* Badge Tag */}
          {tagName && (
            <div className="absolute top-4 left-4 z-20">
              <span className="text-[8px] uppercase tracking-[0.3em] font-black px-4 py-2 bg-emerald-950 text-white rounded-full">
                {tagName}
              </span>
            </div>
          )}

          {/* Type Indicator */}
          <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-amber-500 text-emerald-950 rounded-full">
                {isPerfume ? (language === 'ar' ? 'Collection Parfumée' : 'Grands Crus') : (language === 'ar' ? 'Cristallerie' : 'Flacons d\'Elite')}
             </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col items-center text-center">
          <div className="space-y-1 mb-6">
            <h3 className="font-serif text-xl text-emerald-950 group-hover:text-amber-700 transition-colors duration-500">
              {name}
            </h3>
            <p className="text-emerald-950/20 text-[10px] uppercase font-black tracking-[0.2em]">
              {subName}
            </p>
          </div>
          
          <div className="mt-auto w-full pt-4 border-t border-emerald-50 flex items-center justify-center gap-2">
            <span className="text-emerald-950 font-serif text-2xl tracking-tighter">
              {displayPrice?.toLocaleString()}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">
              DZD {isPerfume ? '/ G' : ''}
            </span>
          </div>
        </div>

        {/* Hover Border Accent */}
        <div className="absolute bottom-0 left-0 h-1 bg-amber-500 w-0 group-hover:w-full transition-all duration-1000" />
      </Link>
    </motion.div>
  )
}
