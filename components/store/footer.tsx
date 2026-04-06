"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';

export function Footer() {
  const { t, language } = useI18n();

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-bold text-primary">
              Amouris
              <span className="text-accent ml-1">Parfums</span>
            </h3>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              {language === 'ar' 
                ? 'الوجهة الأولى لتجار التجزئة للحصول على أجود أنواع العطور الزيتية والقوارير الفاخرة.'
                : 'La destination de choix pour les détaillants à la recherche d\'huiles de parfum et flacons de luxe.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('nav.shop')}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/shop/perfumes" className="hover:text-primary">{t('nav.perfumes')}</Link></li>
              <li><Link href="/shop/flacons" className="hover:text-primary">{t('nav.flacons')}</Link></li>
              <li><Link href="/brands" className="hover:text-primary">{t('nav.brands')}</Link></li>
              <li><Link href="/collections" className="hover:text-primary">{t('nav.collections')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{language === 'ar' ? 'الروابط' : 'Liens'}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/about" className="hover:text-primary">{t('nav.about')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary">{t('nav.contact')}</Link></li>
              <li><Link href="/login" className="hover:text-primary">{t('common.login')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('nav.contact')}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>{language === 'ar' ? 'حي الياسمين، الجزائر العاصمة' : 'Quartier El Yasmine, Alger'}</li>
              <li dir="ltr">+213 550 00 00 00</li>
              <li>contact@amouris-parfums.com</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-secondary-foreground/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Amouris Parfums. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
        </div>
      </div>
    </footer>
  );
}
