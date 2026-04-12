"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { ChevronDown, Globe, ExternalLink, Phone, Mail, MapPin, Camera } from 'lucide-react';
import { useSettingsStore } from '@/store/settings.store';

export function Footer() {
  const { t, language } = useI18n();
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const settings = useSettingsStore();

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'shop',
      title: t('nav.shop'),
      links: [
        { label: t('nav.perfumes'), href: '/shop?type=perfume' },
        { label: t('nav.flacons'), href: '/shop?type=flacon' },
        { label: t('nav.accessoires'), href: '/shop?type=accessory' },
        { label: t('nav.brands'), href: '/shop' },
        { label: t('nav.collections'), href: '/shop' },
      ]
    },
    {
      id: 'links',
      title: t('footer.links'),
      links: [
        { label: t('nav.about'), href: '/about' },
        { label: t('nav.contact'), href: '/contact' },
        { label: t('common.login'), href: '/login' },
        { label: t('footer.admin_link'), href: '/admin/login', discret: true },
      ]
    },
    {
      id: 'contact',
      title: t('nav.contact'),
      content: [
        { icon: MapPin, text: `${settings.address}, ${settings.wilaya}` },
        { icon: Phone, text: settings.phone },
        { icon: Mail, text: settings.email },
      ]
    }
  ];

  return (
    <footer className="bg-emerald-950 text-white border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Socials */}
          <div className="space-y-6">
            <Link href="/" className="font-serif text-2xl tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-3">
              <img src="/logo.png" alt="Amouris Logo" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-white">{language === 'ar' ? settings?.storeNameAR?.split(' ')?.[0] : settings?.storeNameFR?.split(' ')?.[0]}</span>
                <span className="text-amber-500 font-light ml-1"> {language === 'ar' ? settings?.storeNameAR?.split(' ')?.slice(1).join(' ') : settings?.storeNameFR?.split(' ')?.slice(1).join(' ')}</span>
              </div>
            </Link>
            <p className="text-sm text-emerald-100/60 leading-relaxed font-light max-w-xs">
              {language === 'ar' ? settings.sloganAR : settings.sloganFR}
            </p>
            <div className="flex gap-4">
              {settings.instagram && (
                <Link href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-emerald-950 transition-all duration-300">
                  <Camera size={18} />
                </Link>
              )}
              {settings.facebook && (
                <Link href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-400 hover:text-emerald-950 transition-all duration-300">
                  <Globe size={18} />
                </Link>
              )}
            </div>
          </div>

          {/* Columns 2, 3, 4: Shop, Links, Contact */}
          {sections.map((section) => (
            <div key={section.id} className="md:block border-b border-white/10 md:border-0 pb-4 md:pb-0">
              <button 
                onClick={() => toggleSection(section.id)}
                className="w-full md:hidden flex items-center justify-between py-2 text-left rtl:text-right"
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
                        <Link 
                          href={link.href} 
                          className={`transition-colors ${link.discret ? 'text-emerald-100/20 hover:text-emerald-100/60 text-[10px]' : 'hover:text-amber-400'}`}
                        >
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
        
        {/* Bottom Footer */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-sm text-emerald-100/40 uppercase tracking-widest font-light">
          <p>© {new Date().getFullYear()} {language === 'ar' ? settings.storeNameAR : settings.storeNameFR}. {t('footer.rights')}</p>
          <div className="flex gap-8">
            <Link href="/confidentialite" className="hover:text-amber-400 transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/conditions" className="hover:text-amber-400 transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
