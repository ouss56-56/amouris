"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { Product, Category, Brand } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface HomeClientProps {
  categories: Category[];
  brands: Brand[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  announcements: any[];
  tagSections: {
    id: string;
    nameAR: string;
    nameFR: string;
    products: Product[];
  }[];
}

export default function HomeClient({ categories, brands, tagSections }: HomeClientProps) {
  const { t, language } = useI18n();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Emerald & Gold Luxury */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden bg-emerald-950">
        {/* Background Particles (CSS only) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }} 
            />
          ))}
        </div>

        {/* Fond gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900/40 to-black/60" />
        
        {/* Contenu */}
        <div className="container relative z-10 mx-auto px-6 py-16 md:py-32">
          <div className="max-w-4xl">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-400 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 md:mb-6 font-light"
            >
              Amouris Parfums
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-8xl font-serif text-white leading-[1.1] mb-6 md:mb-8"
            >
              {language === 'ar' ? (
                <>اكتشف<br /><span className="text-amber-400 font-normal italic">جوهر</span><br />الفخامة</>
              ) : (
                <>Découvrez<br /><span className="text-amber-400 font-normal italic">l&apos;Essence</span><br />du Luxe</>
              )}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-100/70 text-base md:text-xl mb-8 md:mb-12 font-light leading-relaxed max-w-xl"
            >
              {t('home.hero_subtitle')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/shop" className="bg-amber-400 text-emerald-950 px-8 md:px-10 py-4 md:py-5 font-medium hover:bg-amber-300 transition-all duration-300 text-center uppercase tracking-wider text-sm active:scale-95">
                {t('home.shop_now')}
              </Link>
              <Link href="/register" className="border border-white/30 text-white px-8 md:px-10 py-4 md:py-5 font-light hover:border-white/60 hover:bg-white/5 transition-all duration-300 text-center uppercase tracking-wider text-sm active:scale-95">
                {t('nav.register')}
              </Link>
            </motion.div>

            {/* Hero Stats Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex gap-8 md:gap-12 mt-12 md:mt-20 pt-8 md:pt-10 border-t border-white/10"
            >
              <div>
                <p className="text-xl md:text-3xl font-serif text-amber-400">500+</p>
                <p className="text-[10px] md:text-xs text-emerald-200/60 uppercase tracking-wider mt-1">Références</p>
              </div>
              <div>
                <p className="text-xl md:text-3xl font-serif text-amber-400">48</p>
                <p className="text-[10px] md:text-xs text-emerald-200/60 uppercase tracking-wider mt-1">Wilayas livrées</p>
              </div>
              <div>
                <p className="text-xl md:text-3xl font-serif text-amber-400">B2B</p>
                <p className="text-[10px] md:text-xs text-emerald-200/60 uppercase tracking-wider mt-1">Professionnel</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brands Bar - Infinite Marquee */}
      <section className="bg-white py-8 border-b border-neutral-100 overflow-hidden relative">
        <div className="marquee-container">
          <div className="marquee-track">
            {/* Double the brands for seamless loop */}
            {[...brands, ...brands].map((brand, i) => (
              <span 
                key={`${brand.id}-${i}`} 
                className="text-lg md:text-2xl font-serif text-emerald-950/40 hover:text-emerald-950 transition-colors cursor-default"
              >
                {language === 'ar' ? brand.nameAR : brand.nameFR}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Tag Sections */}
      {tagSections.map((section, sIndex) => (
        <section key={section.id} className={`py-16 md:py-24 ${sIndex % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-8 md:mb-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-amber-500 text-[10px] md:text-xs tracking-[0.2em] uppercase mb-2 md:mb-4 block">
                  {section.id === 't1' ? 'Nouveautés' : section.id === 't2' ? 'Les Préférés' : 'Excellence'}
                </span>
                <h2 className="text-2xl md:text-5xl font-serif text-emerald-950">
                  {language === 'ar' ? section.nameAR : section.nameFR}
                </h2>
                <div className="w-12 h-0.5 bg-amber-400 mt-4 md:mt-6" />
              </motion.div>
              
              <Link href="/shop" className="group flex items-center gap-2 text-emerald-800 text-sm font-medium hover:text-amber-600 transition-colors">
                {t('common.view_all') || 'Voir plus'}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mobile Scroll Row */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory flex gap-4">
              {section.products.map((product) => (
                <div key={product.id} className="snap-start flex-shrink-0 w-[240px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Desktop Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="hidden md:grid grid-cols-4 gap-8"
            >
              {section.products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>

            {section.products.length === 0 && (
              <div className="text-center py-20 bg-neutral-50 border border-dashed border-neutral-200">
                <p className="text-gray-400 font-light italic">
                  {t('common.no_products_found')}
                </p>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Categories Horizontal Scroll on Mobile */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-serif text-emerald-950 mb-10 md:mb-16 text-center">
            {language === 'ar' ? 'تسوق حسب الفئة' : 'Explorer par catégorie'}
          </h2>
          
          <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory flex gap-4">
            {categories.map((category, i) => {
              const gradients = ['from-amber-950 to-amber-900', 'from-rose-950 to-rose-900', 'from-emerald-950 to-emerald-900', 'from-sky-950 to-sky-900', 'from-stone-800 to-stone-900'];
              return (
                <div key={category.id} className="snap-start flex-shrink-0 w-[200px]">
                   <Link href={`/shop?category=${category.id}`} className="block relative h-64 overflow-hidden group">
                     <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]}`} />
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <h3 className="text-lg font-serif text-white">{language === 'ar' ? category.nameAR : category.nameFR}</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Visiter</p>
                     </div>
                   </Link>
                </div>
              );
            })}
          </div>

          <div className="hidden md:grid grid-cols-5 gap-4">
            {categories.map((category, i) => {
              const gradients = ['from-amber-950 to-amber-900', 'from-rose-950 to-rose-900', 'from-emerald-950 to-emerald-900', 'from-sky-950 to-sky-900', 'from-stone-800 to-stone-900'];
              return (
                <motion.div 
                  key={category.id} 
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  <Link href={`/shop?category=${category.id}`} className="group block relative h-72 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} transition-transform duration-700 group-hover:scale-110`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 border border-white/5 group-hover:border-white/20 transition-all duration-500">
                      <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 tracking-widest font-light">Découvrir</span>
                      <h3 className="text-xl font-serif text-white group-hover:text-amber-400 transition-colors duration-500">
                        {language === 'ar' ? category.nameAR : category.nameFR}
                      </h3>
                      <div className="mt-4 w-8 h-[1px] bg-amber-400/50 group-hover:w-16 transition-all duration-500" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Section: Comment commander */}
      <section className="py-16 md:py-24 bg-emerald-950 text-white overflow-hidden relative">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-center font-serif text-3xl md:text-5xl mb-16 text-amber-400">
            Commander en 3 étapes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { step: '01', title: language === 'ar' ? 'اختر منتجاتك' : 'Choisissez vos produits', desc: language === 'ar' ? 'تصفح تشكيلتنا الواسعة من العطور والقوارير وحدد الكميات المطلوبة.' : 'Parcourez notre catalogue de parfums et flacons. Sélectionnez vos quantités.' },
              { step: '02', title: language === 'ar' ? 'أكد طلبك' : 'Confirmez votre commande', desc: language === 'ar' ? 'أدخل معلومات الشحن الخاصة بك. لا حاجة لإنشاء حساب لتتمكن من الطلب.' : 'Renseignez vos coordonnées. Aucun compte requis pour commander.' },
              { step: '03', title: language === 'ar' ? 'توصيل عبر 48 ولاية' : 'Livraison dans toute l\'Algérie', desc: language === 'ar' ? 'الدفع عند الاستلام. تتبع طلبك في الوقت الحقيقي حتى وصوله.' : 'Paiement à la livraison. Suivi de commande en temps réel.' },
            ].map(({ step, title, desc }) => (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: parseInt(step) * 0.1 }}
                className="text-center group"
              >
                <div className="text-6xl md:text-7xl font-serif text-amber-400/20 group-hover:text-amber-400/40 transition-colors duration-500 mb-4">{step}</div>
                <h3 className="font-medium text-lg md:text-xl mb-4 text-emerald-50 tracking-wide">{title}</h3>
                <p className="text-emerald-100/60 font-light text-sm md:text-base leading-relaxed max-w-xs mx-auto">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
