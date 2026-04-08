'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/i18n/i18n-context'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShoppingBag, ArrowRight, PackageCheck } from 'lucide-react'
import { motion } from 'framer-motion'

function SuccessContent() {
  const { t, language } = useI18n()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || '-----'

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-2xl flex flex-col items-center">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center mb-12 shadow-2xl shadow-emerald-900/10 border-4 border-white"
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-900" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-5xl font-serif text-emerald-950 mb-6">
          {t('checkout.success_title')}
        </h1>
        
        <div className="bg-white border border-emerald-50 p-8 rounded-[2rem] shadow-sm mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110" />
            
            <p className="text-emerald-950/40 uppercase tracking-[0.2em] font-black text-[10px] mb-2">Référence Commande</p>
            <div className="text-3xl font-mono font-black text-emerald-900 tracking-tighter mb-4">
                {orderNumber}
            </div>
            
            <div className="h-px bg-emerald-50 w-full mb-6" />
            
            <p className="text-emerald-900/60 leading-relaxed font-medium">
            {language === 'ar'
                ? 'لقد استلمنا طلبك وسنتواصل معك قريباً لتأكيد تفاصيل الشحن. شكراً لثقتك بـ Amouris Parfums!'
                : 'Nous avons bien reçu votre commande et nous vous contacterons bientôt pour confirmer les détails d\'expédition.'}
            </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center w-full"
      >
        <Link href="/shop" className="flex-1">
          <Button variant="outline" className="w-full h-16 rounded-2xl border-emerald-100 text-emerald-900 hover:bg-emerald-50 gap-3 font-bold">
            <ShoppingBag className="w-5 h-5" />
            {t('cart.continue_shopping')}
          </Button>
        </Link>
        <Link href="/account" className="flex-1">
          <Button className="w-full h-16 rounded-2xl bg-emerald-900 text-white hover:bg-emerald-800 gap-3 font-bold shadow-xl shadow-emerald-900/10">
            {language === 'ar' ? 'متابعة الطلب' : 'Suivre ma commande'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </motion.div>

      <div className="mt-16 flex items-center gap-4 text-emerald-950/20 uppercase tracking-[0.3em] font-black text-[9px]">
        <PackageCheck size={16} />
        Vérifié par l'équipe Amouris
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
