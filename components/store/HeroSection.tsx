'use client'
import Link from 'next/link'
import { useI18n } from '@/i18n/i18n-context'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, Star, Globe, ShieldCheck, ChevronDown } from 'lucide-react'
import { useRef } from 'react'

export function HeroSection() {
  const { t, language } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const stats = [
    { icon: Star, label: '500+', sub: t('home.stats_references') },
    { icon: Globe, label: '48', sub: t('home.stats_wilayas') },
    { icon: ShieldCheck, label: 'B2B', sub: t('home.stats_b2b') },
  ]

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-950"
    >
      {/* Dynamic Background Elements */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20 mix-blend-overlay" />
        
        {/* Animated Gold Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="gold-particle"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's'
            }}
          />
        ))}
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-bold">
              Amouris L'Excellence
            </span>
          </motion.div>

          {/* Main Titles */}
          <h1 className="text-6xl md:text-9xl font-serif text-white mb-8 leading-[0.9] tracking-tight">
            <motion.span 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="block"
            >
              {t('home.hero_title_1')}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-gold-gradient italic font-normal block mt-2"
            >
              {t('home.hero_title_2')}
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="max-w-2xl mx-auto text-emerald-100/40 text-lg md:text-xl mb-12 font-light leading-relaxed tracking-wide"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            <Link 
              href="/shop"
              className="group relative px-10 py-5 bg-amber-600 overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-emerald-950 font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                {t('home.hero_cta_primary')}
                {language === 'ar' ? <ArrowLeft size={16} /> : <ArrowLeft size={16} className="rotate-180" />}
              </span>
            </Link>
            
            <Link 
              href="/register"
              className="px-10 py-5 rounded-full border border-white/20 hover:bg-white/5 transition-colors group"
            >
              <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">
                {t('home.hero_cta_secondary')}
              </span>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="grid grid-cols-3 gap-8 md:gap-24 max-w-4xl mx-auto py-12 border-t border-white/5"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-5 h-5 text-amber-500/30 group-hover:text-amber-500 transition-all duration-500 group-hover:scale-125" />
                </div>
                <div className="text-2xl md:text-4xl font-serif text-white mb-1 tracking-tighter">{stat.label}</div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-emerald-100/20 font-black transition-colors group-hover:text-emerald-100/40">
                  {stat.sub}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 hidden md:block"
      >
        <ChevronDown size={24} />
      </motion.div>

      {/* Luxury Decorative Ornaments */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-48 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  )
}
