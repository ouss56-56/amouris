"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckoutSuccessClientProps {
  orderNumber: string;
}

export default function CheckoutSuccessClient({ orderNumber }: CheckoutSuccessClientProps) {
  const { t, language } = useI18n();

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-2xl flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <CheckCircle2 className="w-24 h-24 text-primary mb-8" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-heading font-bold mb-4">
          {t('checkout.success')}
        </h1>
        <p className="text-xl text-muted-foreground mb-4">
          {language === 'ar' ? 'رقم طلبك هو:' : 'Votre numéro de commande est :'} 
          <span className="text-primary font-bold ml-2">{orderNumber}</span>
        </p>
        <p className="text-muted-foreground mb-12">
          {language === 'ar'
            ? 'لقد استلمنا طلبك وسنتواصل معك قريباً لتأكيد تفاصيل الشحن. شكراً لثقتك بـ Amouris Parfums!'
            : 'Nous avons bien reçu votre commande et nous vous contacterons bientôt pour confirmer les détails d\'expédition. Merci de votre confiance en Amouris Parfums !'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link href="/shop">
          <Button size="lg" variant="outline" className="gap-2 min-w-[200px]">
            <ShoppingBag className="w-4 h-4" />
            {t('cart.continue_shopping')}
          </Button>
        </Link>
        <Link href="/account/orders">
          <Button size="lg" className="gap-2 min-w-[200px]">
            {language === 'ar' ? 'طلباتي' : 'Mes commandes'}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
