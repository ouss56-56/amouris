'use client'

import { useState, useEffect } from 'react'
import { X, Menu, ShoppingBag, User, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart.store'
import { useCustomerAuthStore } from '@/store/customer-auth.store'
import { useI18n } from '@/i18n/i18n-context'
import { LanguageToggle } from './language-toggle'
import dynamic from 'next/dynamic'

const CartDrawer = dynamic(() => import('./CartDrawer'), {
  ssr: false,
  loading: () => null
})

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartCount = useCartStore((state) => state.getCount())
  const { currentCustomer: user, logout } = useCustomerAuthStore()
  const { t, language, dir } = useI18n()
  const router = useRouter()
  const isAr = language === 'ar'
  
  const [mounted, setMounted] = useState(false)
  
  const navLinks = [
    { label: t('nav.shop'), href: '/shop' },
    { label: t('nav.perfumes'), href: '/shop/parfums' },
    { label: t('nav.flacons'), href: '/shop/flacons' },
    { label: t('nav.accessoires'), href: '/shop/accessoires' },
    { label: t('nav.brands'), href: '/brands' }
  ]

  useEffect(() => setMounted(true), [])

  // Prevent body scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isRtl = dir === 'rtl'

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100" dir={dir}>
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rtl:-mr-2 rtl:ml-0 touch-manipulation"
            title={t('common.menu')}
          >
            <Menu size={22} className="text-emerald-900" />
          </button>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-lg">
              <span className="text-emerald-800">Amouris</span>
              <span className="text-amber-500"> {t('common.brand_suffix')}</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link 
              href={mounted && user ? "/account" : "/login"} 
              className="min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              <User size={20} className="text-emerald-900" />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 rtl:-ml-2 rtl:mr-0 relative touch-manipulation"
            >
              <ShoppingBag size={20} className="text-emerald-900" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1.5 right-0.5 rtl:right-auto rtl:left-0.5 bg-emerald-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* Backdrop for Navigation Menu */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Drawer — slides from LEFT in LTR, from RIGHT in RTL */}
      <div className={`md:hidden fixed inset-y-0 z-[70] w-[85vw] max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-out ${
        isRtl
          ? `right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
          : `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      }`} dir={dir}>
        <div className="flex flex-col h-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-serif text-xl">
              <span className="text-emerald-800">Amouris</span>
              <span className="text-amber-500"> {t('common.brand_suffix')}</span>
            </span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar - Mobile */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input 
                type="text"
                placeholder={t('common.search')}
                onChange={(e) => {
                  const q = e.target.value;
                  if (q.length > 2) {
                    router.push(`/shop?search=${encodeURIComponent(q)}`);
                    setIsOpen(false);
                  }
                }}
                className="w-full h-12 bg-neutral-50 border border-emerald-950/5 rounded-xl px-4 pl-10 text-sm font-medium focus:outline-none focus:border-[#C9A84C] transition-all"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* Nav links */}
          <nav className="flex-1 py-6 px-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center min-h-[44px] px-3 text-gray-800 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg font-light text-lg transition-colors text-start"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Footer of drawer */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="py-2">
               <LanguageToggle />
            </div>
            
            <Link 
              href={mounted && user ? "/account" : "/login"} 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-2 min-h-[44px] text-sm text-gray-500"
            >
              <User size={16} />
              <span className="text-start">
                {mounted && user 
                  ? t('nav.account') 
                  : t('nav.login')
                }
              </span>
            </Link>

            {mounted && user && (
              <button 
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 min-h-[44px] text-sm text-rose-500 w-full"
              >
                <X size={16} />
                <span className="font-bold text-start">
                  {t('nav.logout')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
