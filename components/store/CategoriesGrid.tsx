'use client'
import Link from 'next/link'
import { useI18n } from '@/i18n/i18n-context'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'

export function CategoriesGrid({ categories }: { categories: any[] }) {
  const { language, t } = useI18n()

  const getBentoClass = (idx: number) => {
    const classes = [
      'md:col-span-3 md:row-span-2', // Large featured
      'md:col-span-2 md:row-span-1', // Medium
      'md:col-span-2 md:row-span-1', // Medium
      'md:col-span-2 md:row-span-2', // Tall
      'md:col-span-2 md:row-span-1', // Small
    ]
    return classes[idx % classes.length]
  }

  const getGradient = (id: string) => {
    const map: Record<string, string> = {
      'cat-01': 'from-amber-200/20 to-orange-100/10',
      'cat-02': 'from-rose-200/20 to-pink-100/10',
      'cat-03': 'from-indigo-200/20 to-blue-100/10',
      'cat-04': 'from-emerald-200/20 to-teal-100/10',
      'cat-05': 'from-stone-200/20 to-gray-100/10',
    }
    return map[id] || 'from-emerald-100/20 to-amber-100/10'
  }

  return (
    <section className="py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-amber-500 w-4 h-4" />
            <span className="text-amber-600 text-[10px] font-black uppercase tracking-[0.4em]">Univers Olfactifs</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl text-emerald-950 mb-6">{t('home.categories')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-6 auto-rows-[200px]">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={getBentoClass(idx)}
            >
              <Link 
                href={`/shop?category=${cat.id}`}
                className={`group relative h-full block p-8 rounded-[2rem] bg-gradient-to-br ${getGradient(cat.id)} border border-emerald-950/5 hover:border-amber-500/30 transition-all duration-700 overflow-hidden shadow-luxury hover:shadow-2xl`}
              >
                {/* Visual texture */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(251,191,36,0.15),transparent_80%)]" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-emerald-50">
                      <span className="text-3xl font-serif text-emerald-950">{(cat.nameFR || cat.id).charAt(0)}</span>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 45 }}
                      className="w-10 h-10 rounded-full bg-emerald-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0"
                    >
                      <ArrowUpRight size={20} />
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl text-emerald-950 mb-2 group-hover:text-amber-600 transition-colors">
                      {language === 'ar' ? cat.nameAR : cat.nameFR}
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-amber-400 group-hover:w-16 transition-all duration-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-900/40 font-black">
                            {language === 'ar' ? cat.nameFR : cat.nameAR}
                        </span>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-3xl group-hover:bg-amber-100/60 transition-colors duration-700" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
