"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { Product, Category, Brand } from '@/lib/types';

interface HomeClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  announcements: any[];
}

export default function HomeClient({ products, categories, brands, announcements }: HomeClientProps) {
  const { t, language } = useI18n();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=2080&auto=format&fit=crop" 
            alt="Luxury Perfume Bottles" 
            fill 
            className="object-cover object-center"
            priority
          />
        </motion.div>
        
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/40 to-black/30" />
        
        <div className="container relative z-20 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg tracking-wide">
              {language === 'ar' ? 'اكتشف جوهر الفخامة' : 'Découvrez l\'Essence du Luxe'}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury-glow transition-all duration-300">
                  {t('home.shop_now')}
                </Button>
              </Link>
              <Link href="/shop?category=collections">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-300">
                  {language === 'ar' ? 'تصفح التشكيلات' : 'Voir les collections'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
          {language === 'ar' ? announcements[0].textAR : announcements[0].textFR}
        </div>
      )}

      {/* Brands Ribbon */}
      <section className="border-y border-border bg-background py-8 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background z-10" />
        <div className="container mx-auto px-4 z-0">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-70"
          >
            {brands.map((brand) => (
              <span key={brand.id} className="text-xl md:text-2xl font-bold font-heading text-muted-foreground hover:text-foreground transition-colors duration-300">
                {language === 'ar' ? brand.nameAR : brand.nameFR}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 tracking-wide">{t('home.best_sellers')}</h2>
            <div className="w-24 h-1 bg-accent rounded-full mb-6" />
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
          
          <div className="mt-16 text-center">
            <Link href="/shop">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 hover:shadow-luxury transition-shadow duration-300">
                {t('home.view_all')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {categories.slice(0, 3).map((category, i) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link href={`/shop?category=${category.id}`} className="group block relative h-80 rounded-2xl overflow-hidden">
                  {category.image && (
                    <Image 
                      src={category.image} 
                      alt={language === 'ar' ? category.nameAR : category.nameFR} 
                      fill 
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-2xl font-bold font-heading text-white mb-2 group-hover:text-accent transition-colors">
                      {language === 'ar' ? category.nameAR : category.nameFR}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
