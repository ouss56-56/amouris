"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-context';
import { LanguageToggle } from './language-toggle';
import { ShoppingBag, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';

export function Header() {
  const { t, dir } = useI18n();
  const cartCount = useCartStore((state) => state.cartCount());
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary">
          Amouris
          <span className="text-accent ml-1">Parfums</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/shop" className="hover:text-primary transition-colors">{t('nav.shop')}</Link>
          <Link href="/shop/perfumes" className="hover:text-primary transition-colors">{t('nav.perfumes')}</Link>
          <Link href="/shop/flacons" className="hover:text-primary transition-colors">{t('nav.flacons')}</Link>
          <Link href="/brands" className="hover:text-primary transition-colors">{t('nav.brands')}</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageToggle />
          
          <Link href={user ? "/account" : "/login"}>
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <User className="h-5 w-5" />
              <span className="sr-only">{t('common.account')}</span>
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">{t('common.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
