'use client'
import { motion } from 'framer-motion'
import { ProductCard } from './product-card'
import { Tag, Product } from '@/lib/types'
import { useI18n } from '@/i18n/i18n-context'
import { Sparkle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TagSectionProps {
  tag: Tag
  products: Product[]
}

export function TagSection({ tag, products }: TagSectionProps) {
  const { language } = useI18n()
  const title = language === 'ar' ? tag.nameAR : tag.nameFR
  const subtitle = language === 'ar' ? tag.nameFR : tag.nameAR

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-amber-400" />
              <Sparkle className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-amber-600 text-[10px] font-black uppercase tracking-[0.4em]">
                {subtitle}
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-emerald-950">
              {title}
            </h2>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            {/* Logic to determine the best landing page based on contents */}
            {(() => {
              const types = products.map(p => p.type);
              const isAllPerfume = types.length > 0 && types.every(t => t === 'perfume');
              const isAllFlacon = types.length > 0 && types.every(t => t === 'flacon');
              const baseUrl = isAllPerfume ? '/shop/perfumes' : isAllFlacon ? '/shop/flacons' : '/shop';
              
              return (
                <Link 
                  href={`${baseUrl}?tag=${tag.id}`}
                  className="group flex items-center gap-3 text-emerald-950 font-bold uppercase tracking-widest text-[10px] hover:text-amber-600 transition-colors"
                >
                  {language === 'ar' ? 'اكتشف المجموعة' : 'Découvrir la collection'}
                  <div className="w-10 h-10 rounded-full border border-emerald-950/10 flex items-center justify-center group-hover:bg-emerald-950 group-hover:text-white transition-all duration-500">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })()}
          </motion.div>
        </div>

        <div className="relative group">
          <div className="flex overflow-x-auto gap-8 pb-12 pt-4 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 w-80 snap-start"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          {/* Subtle scroll indicator background */}
          <div className="h-[1px] w-full bg-emerald-50 relative mt-4">
            <motion.div 
               className="absolute top-0 left-0 h-full bg-amber-400 w-1/4"
               animate={{ x: ['0%', '300%', '0%'] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Background Decorative Text */}
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 font-serif text-[200px] text-emerald-950/[0.02] pointer-events-none select-none uppercase tracking-tighter">
        {title}
      </div>
    </section>
  )
}
