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
  const isPerfume = product.type === 'perfume'
  
  // Get tag info
  const firstTag = tags.find(tag => product.tagIds?.includes(tag.id))
  const tagName = firstTag ? (language === 'ar' ? firstTag.nameAR : firstTag.nameFR) : null

  const displayPrice = isPerfume 
    ? product.pricePerGram
    : Math.min(...(product.variants?.map(v => v.price) || [0]))

  // Category based styling
  const getGradient = (catId: string) => {
    const gradients: Record<string, string> = {
      'cat-01': 'from-amber-50 to-orange-50', // Oud
      'cat-02': 'from-rose-50 to-pink-50',     // Floral
      'cat-03': 'from-indigo-50 to-blue-50',    // Oriental
      'cat-04': 'from-emerald-50 to-teal-50',  // Frais
      'cat-05': 'from-amber-100 to-yellow-50', // Boisé
      'cat-06': 'from-neutral-50 to-gray-100', // Musqué
    }
    return gradients[catId] || 'from-emerald-50/50 to-amber-50/50'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/product/${product.slug}`} className="group block relative bg-white border border-emerald-50 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Image / Gradient Container */}
        <div className={`relative aspect-square md:aspect-[4/5] overflow-hidden bg-gradient-to-br ${getGradient(product.categoryId)}`}>
          {product.images?.[0] ? (
            <Image 
              src={product.images[0]} 
              alt={name} 
              fill 
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-emerald-900/10 font-serif text-8xl md:text-9xl select-none group-hover:scale-110 transition-transform duration-700">
                    {(product.nameFR || 'P').charAt(0)}
                </span>
            </div>
          )}
          
          {/* Badge Tag */}
          {tagName && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold bg-white text-emerald-950 shadow-sm rounded-full">
                {tagName}
              </span>
            </div>
          )}

          {/* Badge Type */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-[8px] uppercase tracking-[0.2em] px-2.5 py-1.5 font-bold rounded-full ${isPerfume ? 'bg-emerald-900 text-white' : 'bg-amber-500 text-emerald-900'}`}>
              {isPerfume ? (language === 'ar' ? 'عطر' : 'Parfum') : (language === 'ar' ? 'قارورة' : 'Flacon')}
            </span>
          </div>

          <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/5 transition-colors duration-300" />
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <span className="w-full text-center bg-white/95 backdrop-blur-sm text-emerald-950 text-[10px] uppercase tracking-[0.2em] py-3 font-bold shadow-xl rounded-xl border border-emerald-100 ring-4 ring-black/5">
              {t('common.view_details')}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="font-serif text-lg md:text-xl text-emerald-950 mb-1 line-clamp-2 md:line-clamp-1 group-hover:text-emerald-700 transition-colors leading-tight">
              {name}
            </h3>
            <p className="text-emerald-900/30 font-arabic text-sm text-right" dir="rtl">{language === 'ar' ? product.nameFR : product.nameAR}</p>
          </div>
          
          <div className="mt-auto pt-4 border-t border-emerald-50 flex items-center justify-between">
            <p className="text-emerald-950 font-black text-base md:text-xl">
              {displayPrice?.toLocaleString()} <span className="text-[10px] font-normal text-emerald-900/50 uppercase tracking-widest">{isPerfume ? 'DZD/g' : 'DZD'}</span>
            </p>
            {!isPerfume && <span className="text-[10px] text-emerald-900/40 font-medium uppercase tracking-tighter italic">Dès</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
