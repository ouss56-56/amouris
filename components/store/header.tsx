"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { usePathname } from 'next/navigation';
import { LanguageToggle } from './language-toggle';
import { ShoppingBag, User, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { useCartStore } from '@/store/cart.store';
import { useCustomerAuth } from '@/store/customer-auth.store';
import { MobileHeader } from './MobileHeader';
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('./CartDrawer'), { 
  ssr: false,
  loading: () => null 
});

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.getCount());
  const { customer: user } = useCustomerAuth();
  
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      // Show if scrolling up or at the very top
      setVisible(current < lastScroll || current < 60);
      setLastScroll(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  return (
    <>
      <MobileHeader />
      
      {/* Desktop/Tablet Header */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-700 ${visible ? 'translate-y-0' : '-translate-y-full'} ${lastScroll > 60 ? 'bg-white/80 backdrop-blur-xl border-b border-emerald-950/5 shadow-luxury py-2' : 'bg-transparent py-4'}`}
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
                  {/* Subtle hover line */}
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-amber-400 transition-all duration-500 ${isActive ? 'w-full' : 'w-0 group-hover/nav:w-full'}`} />
                  {/* Luxury dot for active */}
                  {isActive && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}
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
            
            <Link 
              href="/admin" 
              className="ml-2 p-2 text-emerald-950/10 hover:text-emerald-950 transition-colors"
              title="Portail Client"
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


