"use client";

import { useI18n } from '@/i18n/i18n-context';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const { language } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=2000')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-amber-400 mb-4"
          >
            {language === 'ar' ? 'حول Amouris Parfums' : 'À propos d\'Amouris Parfums'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-emerald-100 text-lg max-w-2xl mx-auto font-light"
          >
            {language === 'ar' 
              ? 'التميز في صناعة العطور وتوزيع الزيوت العطرية الفاخرة.' 
              : 'L\'excellence dans la parfumerie et la distribution d\'huiles de parfum de luxe.'}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid gap-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-emerald-900 border-b border-emerald-100 pb-4">
              {language === 'ar' ? 'قصتنا' : 'Notre Histoire'}
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4 font-light text-lg">
              <p>
                {language === 'ar'
                  ? 'تأسست Amouris Parfums برؤية تهدف إلى جلب أرقى الروائح العالمية إلى السوق الجزائرية. نحن متخصصون في توريد الزيوت العطرية عالية الجودة والقوارير المصممة خصيصاً للمحترفين.'
                  : 'Amouris Parfums a été fondée avec la vision d\'apporter les fragrances les plus raffinées du monde sur le marché algérien. Nous nous spécialisons dans l\'approvisionnement d\'huiles de parfum de haute qualité et de flacons exclusifs pour les professionnels.'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 p-8 bg-emerald-50/50 border border-emerald-100">
              <h3 className="text-xl font-serif text-emerald-800">
                {language === 'ar' ? 'مهمتنا' : 'Notre Mission'}
              </h3>
              <p className="text-gray-600 font-light">
                {language === 'ar'
                  ? 'تمكين تجار التجزئة وصناع العطور بمنتجات استثنائية تساعدهم على تنمية أعمالهم.'
                  : 'Accompagner les détaillants et les créateurs de parfums avec des produits exceptionnels qui les aident à développer leur activité.'}
              </p>
            </div>
            <div className="space-y-4 p-8 bg-amber-50/50 border border-amber-100">
              <h3 className="text-xl font-serif text-amber-800">
                {language === 'ar' ? 'قيمنا' : 'Nos Valeurs'}
              </h3>
              <ul className="text-gray-600 font-light space-y-2 list-disc list-inside">
                <li>{language === 'ar' ? 'الجودة المطلقة' : 'Qualité absolue'}</li>
                <li>{language === 'ar' ? 'النزاهة والشفافية' : 'Intégrité et transparence'}</li>
                <li>{language === 'ar' ? 'خدمة العملاء المتميزة' : 'Service client d\'excellence'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
