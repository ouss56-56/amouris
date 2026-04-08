'use client'
import Link from 'next/link'
import { useI18n } from '@/i18n/i18n-context'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export function CategoriesGrid({ categories }: { categories: any[] }) {
  const { language } = useI18n()

  const getGradient = (id: string) => {
    const map: Record<string, string> = {
      'cat-01': 'from-amber-100/50 to-orange-50/50 hover:bg-amber-100',
      'cat-02': 'from-rose-100/50 to-pink-50/50 hover:bg-rose-100',
      'cat-03': 'from-indigo-100/50 to-blue-50/50 hover:bg-indigo-100',
      'cat-04': 'from-emerald-100/50 to-teal-50/50 hover:bg-emerald-100',
      'cat-05': 'from-stone-100/50 to-gray-50/50 hover:bg-stone-100',
    }
    return map[id] || 'from-emerald-50 to-amber-50 hover:bg-emerald-100/50'
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h2 className="font-serif text-4xl md:text-5xl text-emerald-950 mb-4">Explorez par Univers</h2>
        <div className="w-12 h-1 bg-amber-400 mx-auto rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                href={`/shop?category=${cat.id}`}
                className={`group block p-8 rounded-3xl bg-gradient-to-br ${getGradient(cat.id)} border border-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/5 relative overflow-hidden`}
              >
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl font-serif text-emerald-900">{(cat.nameFR || cat.id).charAt(0)}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-950 text-base md:text-lg mb-1">{language === 'ar' ? cat.nameAR : cat.nameFR}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-emerald-900/40 font-black">{language === 'ar' ? cat.nameFR : cat.nameAR}</span>
                  </div>
                </div>
                
                {/* Decoration */}
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-emerald-900/10 group-hover:text-emerald-900/40 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
