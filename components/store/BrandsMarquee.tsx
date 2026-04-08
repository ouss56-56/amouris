'use client'
import { useI18n } from '@/i18n/i18n-context'
import { motion } from 'framer-motion'

export function BrandsMarquee({ brands }: { brands: any[] }) {
  const { language } = useI18n()

  // Double the brands to create seamless loop
  const displayBrands = [...brands, ...brands, ...brands]

  return (
    <div className="py-20 bg-white border-y border-emerald-50/50 overflow-hidden group/marquee relative">
      <div className="absolute inset-0 pointer-events-none z-10 marquee-mask bg-gradient-to-r from-white via-transparent to-white" />
      
      <div className="mb-12 text-center relative z-20">
        <motion.div
           initial={{ opacity: 0, letterSpacing: '0.2em' }}
           whileInView={{ opacity: 1, letterSpacing: '0.6em' }}
           viewport={{ once: true }}
           transition={{ duration: 1.5 }}
           className="text-[10px] uppercase font-black text-emerald-950/20"
        >
          Nos Partenaires de Prestige
        </motion.div>
      </div>
      
      <div className="flex overflow-hidden relative z-0">
        <div className="flex gap-24 items-center animate-scroll hover:[animation-play-state:paused] whitespace-nowrap px-12 py-4">
          {displayBrands.map((brand, idx) => (
            <motion.div 
                key={`${brand.id}-${idx}`}
                whileHover={{ y: -5, scale: 1.1 }}
                className="flex flex-col items-center gap-3 group/brand cursor-default"
            >
                <div className="relative">
                    <span className="text-gray-300 group-hover/brand:text-emerald-950 font-serif text-4xl md:text-6xl transition-all duration-700 scale-90 group-hover/brand:scale-100 italic opacity-20 group-hover/brand:opacity-100 px-6 select-none">
                        {language === 'ar' ? brand.nameAR : brand.nameFR}
                    </span>
                    <div className="absolute -bottom-2 left-0 w-0 group-hover/brand:w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ease-out" />
                </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          display: flex;
          width: fit-content;
        }
      `}</style>
    </div>
  )
}
