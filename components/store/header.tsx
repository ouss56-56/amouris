"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { usePathname } from 'next/navigation';
import { LanguageToggle } from './language-toggle';
import { MobileHeader } from './MobileHeader';
import { useCataloguesStore } from '@/store/catalogues.store';
import { Download, FileText, ChevronDown, ShoppingBag, User, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('./CartDrawer'), { 
  ssr: false,
  loading: () => null 
});

export function Header() {
  const { t, language } = useI18n();
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.getCount());
  const { customer: user, logout } = useCustomerAuth();
  const { catalogues } = useCataloguesStore();
  const [showCatMenu, setShowCatMenu] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = language === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const isVisibleNow = current < lastScroll.current || current < 60;
      if (isVisibleNow !== visible) {
        setVisible(isVisibleNow);
      }
      lastScroll.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible]);

  return (
    <>
      <MobileHeader />
      
      {/* Desktop/Tablet Header — hidden on mobile */}
      <header 
        className={`hidden md:block sticky top-0 z-50 w-full transition-all duration-700 ${visible ? 'translate-y-0' : '-translate-y-full'} ${mounted && window.scrollY > 60 ? 'bg-white/80 backdrop-blur-xl border-b border-emerald-950/5 shadow-luxury py-2' : 'bg-transparent py-4'}`}
      >
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex flex-col items-start">
            <span className="font-serif text-2xl tracking-tighter text-emerald-950 leading-none group-hover:text-emerald-800 transition-colors">
              Amouris
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-black leading-none mt-1">
              L'Excellence
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-950/60">
            {[
              { name: t('nav.shop'), href: '/shop' },
              { name: t('nav.perfumes'), href: '/shop/perfumes' },
              { name: t('nav.flacons'), href: '/shop/flacons' },
              { name: t('nav.brands'), href: '/brands' },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`relative group/nav py-2 transition-all duration-500 ${isActive ? 'text-emerald-950' : 'hover:text-emerald-950'}`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-amber-400 transition-all duration-500 ${isActive ? 'w-full' : 'w-0 group-hover/nav:w-full'}`} />
                  {isActive && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}

            {/* Catalogues Dropdown */}
            {(catalogues.length > 0) && (
              <div 
                className="relative group/cat py-2 cursor-pointer"
                onMouseEnter={() => setShowCatMenu(true)}
                onMouseLeave={() => setShowCatMenu(false)}
              >
                <div className="flex items-center gap-1 hover:text-emerald-950 transition-colors">
                  {isAr ? 'الكتالوجات' : 'Catalogues'}
                  <ChevronDown size={10} className={`transition-transform duration-300 ${showCatMenu ? 'rotate-180' : ''}`} />
                </div>
                
                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${showCatMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                   <div className="bg-white rounded-2xl shadow-luxury border border-emerald-950/5 p-2 min-w-[180px]">
                      {catalogues.map(cat => (
                        <a 
                          key={cat.id}
                          href={cat.file_data} 
                          download={cat.filename}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 rounded-xl transition-colors group/item"
                        >
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                             <Download size={14} />
                          </div>
                          <span className="normal-case font-bold text-emerald-950/60 group-hover/item:text-emerald-950 transition-colors">
                            {cat.type === 'parfums' ? (isAr ? 'عطور' : 'Parfums') : (isAr ? 'قنينات' : 'Flacons')}
                          </span>
                        </a>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
            
            <Link href={mounted && user ? "/account" : "/login"}>
              <div className="w-10 h-10 rounded-full border border-emerald-950/10 flex items-center justify-center hover:bg-emerald-950 hover:text-white transition-all duration-500">
                <User className="h-4 w-4" />
              </div>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative w-10 h-10 rounded-full border border-emerald-950/10 flex items-center justify-center hover:bg-emerald-950 hover:text-white transition-all duration-500"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="sr-only">{t('common.cart')}</span>
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-emerald-950 text-[8px] font-black flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Button>
            
            {mounted && user && (
              <button 
                onClick={logout}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 hover:text-rose-600 transition-colors ml-2"
              >
                {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
              </button>
            )}

            <Link 
              href="/admin" 
              className="ml-2 p-2 text-emerald-950/10 hover:text-emerald-950 transition-colors"
              title={t('nav.admin_access')}
            >
              <Shield size={16} />
            </Link>
          </div>
        </div>
      </header>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}


