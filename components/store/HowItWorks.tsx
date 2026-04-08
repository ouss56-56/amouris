'use client'
import { useI18n } from '@/i18n/i18n-context'
import { motion } from 'framer-motion'
import { Sparkles, PackageCheck, CreditCard, Truck, BadgeCheck } from 'lucide-react'

export function HowItWorks() {
  const { t, language } = useI18n()

  const steps = [
    {
      icon: PackageCheck,
      title: t('home.step1_title'),
      desc: t('home.step1_desc'),
      number: '01'
    },
    {
      icon: CreditCard,
      title: t('home.step2_title'),
      desc: t('home.step2_desc'),
      number: '02'
    },
    {
      icon: Truck,
      title: t('home.step3_title'),
      desc: t('home.step3_desc'),
      number: '03'
    }
  ]

  return (
    <section className="py-32 relative overflow-hidden bg-emerald-950">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-900/10 skew-x-[-15deg] translate-x-1/2" />
      <div className="absolute -left-20 top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <BadgeCheck className="text-amber-500 w-5 h-5" />
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.5em]">L'Alliance du Service</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-6xl text-white mb-8"
          >
            {t('home.how_title')}
          </motion.h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-16 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[15%] w-[70%] h-px bg-white/5 z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
              className="relative group text-center"
            >
              <div className="relative z-10">
                <div className="w-32 h-32 bg-emerald-900/50 border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 transition-all duration-700 group-hover:bg-amber-600 group-hover:border-amber-400 group-hover:-rotate-6 group-hover:scale-110 shadow-luxury">
                    <step.icon size={48} className="text-amber-500 group-hover:text-emerald-950 transition-all duration-500" />
                    
                    {/* Number Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white text-emerald-950 rounded-2xl flex items-center justify-center font-serif font-black text-lg shadow-2xl transition-transform duration-500 group-hover:rotate-12">
                        {step.number}
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-amber-400 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>

                <h3 className="text-3xl font-serif text-white mb-6 tracking-tight transition-colors group-hover:text-amber-400">
                  {step.title}
                </h3>
                
                <p className="text-emerald-100/30 leading-relaxed text-sm max-w-[280px] mx-auto font-light tracking-wide px-4 group-hover:text-emerald-100/50 transition-colors">
                  {step.desc}
                </p>
                
                {/* Decorative dots for connector */}
                {idx < 2 && (
                    <div className="hidden md:flex absolute top-[4.25rem] -right-8 gap-1 opacity-20">
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Call to action footer in How it works */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-32 text-center"
        >
            <p className="text-emerald-100/20 text-[10px] uppercase font-black tracking-[0.4em] mb-6">Prêt à commencer l'aventure ?</p>
            <div className="flex items-center justify-center gap-2 text-amber-500 font-serif italic text-xl">
                <span>Tradition</span>
                <Sparkles className="w-4 h-4 mx-2" />
                <span>Excellence</span>
                <Sparkles className="w-4 h-4 mx-2" />
                <span>Prestige</span>
            </div>
        </motion.div>
      </div>
    </section>
  )
}
