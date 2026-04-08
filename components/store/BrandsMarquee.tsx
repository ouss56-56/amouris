'use client'
import { useI18n } from '@/i18n/i18n-context'

export function BrandsMarquee({ brands }: { brands: any[] }) {
  const { language } = useI18n()

  // Double the brands to create seamless loop
  const displayBrands = [...brands, ...brands, ...brands]

  return (
    <div className="py-16 bg-white border-y border-emerald-50 overflow-hidden group">
        <div className="mb-10 text-center">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-emerald-950/20">Nos Partenaires de Prestige</h3>
        </div>
      
      <div className="flex overflow-hidden">
        <div className="flex gap-20 items-center animate-scroll hover:[animation-play-state:paused] whitespace-nowrap px-10">
          {displayBrands.map((brand, idx) => (
            <div 
                key={`${brand.id}-${idx}`}
                className="flex flex-col items-center gap-2 group/brand"
            >
                <span className="text-gray-300 group-hover/brand:text-emerald-900 font-serif text-3xl md:text-5xl transition-all duration-500 scale-90 group-hover/brand:scale-100 italic opacity-40 group-hover/brand:opacity-100 px-4">
                    {language === 'ar' ? brand.nameAR : brand.nameFR}
                </span>
                <div className="w-0 group-hover/brand:w-full h-0.5 bg-amber-400 transition-all duration-500 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          display: flex;
          width: fit-content;
        }
      `}</style>
    </div>
  )
}
