'use client'

import { Drawer } from 'vaul'
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useI18n } from '@/i18n/i18n-context'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CartDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { items, removeItem, updateQuantity, cartTotal } = useCartStore()
  const { t, language } = useI18n()

  const isEmpty = items.length === 0

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="bottom">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[95vh] flex-col rounded-t-[20px] bg-white">
          <div className="flex-1 overflow-y-auto rounded-t-[20px] bg-white p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 shrink-0 rounded-full bg-gray-200" />
            
            <div className="flex items-center justify-between mb-6">
              <Drawer.Title className="font-serif text-2xl text-emerald-950">
                {t('common.cart')} ({items.length})
              </Drawer.Title>
              <button 
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-emerald-700" />
                </div>
                <h3 className="font-serif text-xl text-gray-800 mb-2">Votre panier est vide</h3>
                <p className="text-gray-500 text-sm mb-6">Découvrez nos parfums et flacons d'exception</p>
                <button 
                  onClick={() => onOpenChange(false)}
                  className="bg-emerald-800 text-white px-8 py-3 text-sm font-medium hover:bg-emerald-700 transition-colors uppercase tracking-wider"
                >
                  Explorer la boutique
                </button>
              </div>
            ) : (
              <div className="space-y-6 pb-24">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 border-b border-gray-50 pb-6">
                    <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.nameFR} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    
                    <div className="flex flex-col flex-1 justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-base text-emerald-950 leading-tight">
                            {language === 'ar' ? item.nameAR : item.nameFR}
                          </h4>
                          <button 
                            onClick={() => removeItem(item.cartItemId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {item.variantDescriptionLabel && (
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                            {item.variantDescriptionLabel}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-100 rounded-none bg-white">
                          <button 
                            className="p-2 hover:bg-gray-50 text-emerald-900 disabled:opacity-30"
                            onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - (item.variantDescriptionLabel ? 1 : 50)))}
                            disabled={item.quantity <= (item.variantDescriptionLabel ? 1 : 50)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-xs font-medium">
                            {item.quantity}{item.variantDescriptionLabel ? '' : 'g'}
                          </span>
                          <button 
                            className="p-2 hover:bg-gray-50 text-emerald-900"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + (item.variantDescriptionLabel ? 1 : 50))}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-emerald-900 font-bold text-sm">
                          {(item.quantity * item.unitPrice).toLocaleString()} DZD
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isEmpty && (
            <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600 font-light">Total estimé</span>
                <span className="text-emerald-900 font-serif font-bold text-2xl">{cartTotal().toLocaleString()} DZD</span>
              </div>
              <Link 
                href="/checkout" 
                onClick={() => onOpenChange(false)}
                className="block w-full bg-emerald-800 text-white text-center py-4 font-medium uppercase tracking-[0.2em] text-sm hover:bg-emerald-900 transition-colors active:scale-[0.98]"
              >
                Passer à la caisse
              </Link>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
