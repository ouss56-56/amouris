"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { ChevronDown, Globe, ExternalLink, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'shop',
      title: t('nav.shop'),
      links: [
        { label: t('nav.perfumes'), href: '/shop/perfumes' },
        { label: t('nav.flacons'), href: '/shop/flacons' },
        { label: t('nav.brands'), href: '/brands' },
        { label: t('nav.collections'), href: '/collections' },
      ]
    },
    {
      id: 'links',
      title: language === 'ar' ? 'الروابط' : 'Liens',
      links: [
        { label: t('nav.about'), href: '/about' },
        { label: t('nav.contact'), href: '/contact' },
        { label: t('common.login'), href: '/login' },
        { label: language === 'ar' ? 'بياناتي' : 'Mon compte', href: '/account' },
      ]
    },
    {
      id: 'contact',
      title: t('nav.contact'),
      content: [
        { icon: MapPin, text: language === 'ar' ? 'حي الياسمين، الجزائر العاصمة' : 'Quartier El Yasmine, Alger' },
        { icon: Phone, text: '+213 550 00 00 00' },
        { icon: Mail, text: 'contact@amouris-parfums.com' },
      ]
    }
  ];

  return (
    <footer className="bg-emerald-950 text-white border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="font-serif text-2xl tracking-tighter hover:opacity-80 transition-opacity">
              <span className="text-white">Amouris</span>
              <span className="text-amber-500 font-light ml-1"> Parfums</span>
            </Link>
            <p className="text-sm text-emerald-100/60 leading-relaxed font-light max-w-xs">
              {language === 'ar' 
                ? 'الوجهة الأولى لتجار التجزئة للحصول على أجود أنواع العطور الزيتية والقوارير الفاخرة.'
                : "L'excellence au service des professionnels. La destination de choix pour les huiles de parfum et flacons de luxe."}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-emerald-950 transition-all duration-300">
                <Globe size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-emerald-950 transition-all duration-300">
                <ExternalLink size={18} />
              </Link>
            </div>
          </div>


          {/* Desktop Links Columns / Mobile Accordion */}
          {sections.map((section) => (
            <div key={section.id} className="md:block border-b border-white/10 md:border-0 pb-4 md:pb-0">
              <button 
                onClick={() => toggleSection(section.id)}
                className="w-full md:hidden flex items-center justify-between py-2 text-left"
              >
                <h4 className="font-serif text-lg text-amber-400 uppercase tracking-widest">{section.title}</h4>
                <ChevronDown className={`transition-transform duration-300 ${openSection === section.id ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              <h4 className="hidden md:block font-serif text-lg text-amber-400 uppercase tracking-widest mb-6">{section.title}</h4>
              
              <div className={`${openSection === section.id ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
                {section.links && (
                  <ul className="space-y-4 text-sm text-emerald-100/60 font-light">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="hover:text-amber-400 transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {section.content && (
                  <ul className="space-y-4 text-sm text-emerald-100/60 font-light">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <item.icon size={16} className="shrink-0 text-amber-400/50" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-sm text-emerald-100/40 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Amouris Parfums. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Conditions</Link>
            <Link href="/admin/login" className="hover:text-emerald-300 transition-colors">
              {language === 'ar' ? 'الإدارة' : 'Administration'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

