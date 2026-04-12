'use client'

import { useState, useMemo } from 'react'
import { Brand } from '@/store/brands.store'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Store, Loader2 } from 'lucide-react'
import { BrandModal } from '@/components/admin/BrandModal'
import { deleteBrandAction } from '@/lib/actions/brands'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface BrandsClientProps {
  initialBrands: (Brand & { product_count: number })[]
}

export default function BrandsClient({ initialBrands }: BrandsClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const brands = initialBrands

  const filtered = useMemo(() => {
    return brands.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase()) || 
      (b.name_ar && b.name_ar.includes(search))
    )
  }, [brands, search])

  const handleAdd = () => {
    setEditingBrand(null)
    setModalOpen(true)
  }

  const handleEdit = (b: Brand) => {
    setEditingBrand(b)
    setModalOpen(true)
  }

  const handleDelete = async (brand: Brand & { product_count: number }) => {
    if (brand.product_count > 0) {
      toast.error(`Impossible de supprimer : cette maison contient ${brand.product_count} références.`)
      return
    }
    if (confirm('Voulez-vous vraiment supprimer cette marque ?')) {
      try {
        const result = await deleteBrandAction(brand.id)
        if (result.success) {
          router.refresh()
          toast.success('Maison supprimée')
        } else {
          toast.error('Erreur: ' + result.error)
        }
      } catch (err: any) {
        toast.error('Erreur: ' + err.message)
      }
    }
  }

  return (
    <div className="space-y-12 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bold italic">Les Maisons</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Gestion des marques et partenaires</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0a3d2e] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={16} /> Ajouter une Maison
        </button>
      </header>

      <section className="relative group">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
        <input 
          type="text"
          placeholder="Rechercher une marque..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((brand) => (
            <motion.div 
              layout
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white p-8 rounded-[3rem] border border-emerald-950/5 shadow-xl shadow-emerald-950/5 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 p-12 opacity-[0.02] group-hover:scale-110 transition-transform">
                  <Store size={140} />
              </div>

              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center text-emerald-950/20 group-hover:bg-emerald-50 group-hover:text-amber-600 transition-all overflow-hidden border border-emerald-950/5 p-4 mix-blend-multiply shadow-inner">
                  {brand.logo_url && !imageErrors[brand.id] ? (
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name} 
                      className="w-full h-full object-contain" 
                      onError={() => setImageErrors(prev => ({ ...prev, [brand.id]: true }))}
                    />
                  ) : (
                    <Store size={40} />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-emerald-950 mb-1 leading-tight font-bold">{brand.name}</h3>
                  <p className="text-xl font-arabic text-emerald-950/30 text-right" dir="rtl">{brand.name_ar}</p>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                <p className="text-xs text-emerald-950/60 leading-relaxed font-medium line-clamp-2">
                  {brand.description_fr || "Aucune description fournie pour cette marque."}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-emerald-950/5">
                  <div className="text-[10px] font-black uppercase text-emerald-950/20 tracking-widest">
                    {brand.product_count} Références
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(brand)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(brand)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center text-emerald-950/20">
          <Store size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-2xl italic">Aucune marque trouvée.</p>
        </div>
      )}

      <BrandModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        brand={editingBrand} 
        onSave={() => router.refresh()}
      />
    </div>
  )
}
