"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { LanguageToggle } from './language-toggle';
import { ShoppingBag, User, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { useCartStore } from '@/store/cart-store';
import { useCustomerAuth } from '@/store/customer-auth.store';
import { MobileHeader } from './MobileHeader';
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('./CartDrawer'), { 
  ssr: false,
  loading: () => null 
});

export function Header() {
  const { t } = useI18n();
  const cartCount = useCartStore((state) => state.cartCount());
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
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl tracking-tighter text-emerald-950 hover:opacity-80 transition-opacity">
            <span className="text-emerald-800">Amouris</span>
            <span className="text-amber-500 font-light"> Parfums</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-[0.15em]">
            <Link href="/shop" className="hover:text-emerald-700 transition-colors">{t('nav.shop')}</Link>
            <Link href="/shop/perfumes" className="hover:text-emerald-700 transition-colors">{t('nav.perfumes')}</Link>
            <Link href="/shop/flacons" className="hover:text-emerald-700 transition-colors">{t('nav.flacons')}</Link>
            <Link href="/brands" className="hover:text-emerald-700 transition-colors">{t('nav.brands')}</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            
            <Link href={mounted && user ? "/account" : "/login"}>
              <Button variant="ghost" size="icon" className="hover:text-emerald-700 hover:bg-emerald-50 rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">{t('common.account')}</span>
              </Button>
            </Link>

            {/* Admin — discret, sans texte, juste l'icône */}
            <Link 
              href="/admin/login" 
              className="p-2 text-gray-300 hover:text-emerald-700 transition-colors"
              title="Administration"
            >
              <Shield size={18} />
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">{t('common.cart')}</span>
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}


