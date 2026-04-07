'use client'

import { useState, useEffect } from 'react'
import { X, Menu, ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { LanguageToggle } from './language-toggle'
import dynamic from 'next/dynamic'

const CartDrawer = dynamic(() => import('./CartDrawer'), {
  ssr: false,
  loading: () => null
})

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartCount = useCartStore((state) => state.cartCount())
  
  const navLinks = [
    { label: 'Boutique', href: '/shop' },
    { label: 'Parfums', href: '/shop/perfumes' },
    { label: 'Flacons', href: '/shop/flacons' },
    { label: 'Marques', href: '/brands' }
  ]

  // Prevent body scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 touch-manipulation"
            aria-label="Menu"
          >
            <Menu size={22} className="text-emerald-900" />
          </button>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-lg">
              <span className="text-emerald-800">Amouris</span>
              <span className="text-amber-500"> Parfums</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link href="/account" className="p-2 touch-manipulation">
              <User size={20} className="text-emerald-900" />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 -mr-2 relative touch-manipulation"
            >
              <ShoppingBag size={20} className="text-emerald-900" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0 bg-emerald-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
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

      {/* Navigation Drawer */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-[70] w-[85vw] max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-serif text-xl">
              <span className="text-emerald-800">Amouris</span>
              <span className="text-amber-500"> Parfums</span>
            </span>
            <button onClick={() => setIsOpen(false)} className="p-2">
              <X size={20} />
            </button>
          </div>
          
          {/* Nav links */}
          <nav className="flex-1 py-6 px-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center h-12 px-3 text-gray-800 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg font-light text-lg transition-colors"
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
            <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-gray-500">
              <User size={16} />
              <span>Connexion / Créer un compte</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

