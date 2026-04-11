'use client'

import { useState, useMemo } from 'react'
import { Collection } from '@/store/collections.store'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Layers, Box } from 'lucide-react'
import { CollectionModal } from '@/components/admin/CollectionModal'
import { removeCollection } from '@/lib/api/catalogue'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CollectionsClientProps {
  initialCollections: (Collection & { product_count: number })[]
}

export default function CollectionsClient({ initialCollections }: CollectionsClientProps) {
  const router = useRouter()
  const collections = initialCollections
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  const filtered = useMemo(() => {
    return collections.filter(c => 
      c.name_fr.toLowerCase().includes(search.toLowerCase()) || 
      (c.name_ar && c.name_ar.includes(search))
    )
  }, [collections, search])

  const handleAdd = () => {
    setEditingCollection(null)
    setModalOpen(true)
  }

  const handleEdit = (c: Collection) => {
    setEditingCollection(c)
    setModalOpen(true)
  }

  const handleDelete = async (col: Collection & { product_count: number }) => {
    if (col.product_count > 0) {
      toast.error(`Impossible de supprimer : cette collection contient ${col.product_count} références.`)
      return
    }
    if (confirm('Voulez-vous vraiment supprimer cette collection ?')) {
      try {
        await removeCollection(col.id)
        router.refresh()
        toast.success('Collection supprimée')
      } catch (err: any) {
        toast.error('Erreur: ' + err.message)
      }
    }
  }

  return (
    <div className="space-y-12 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <h1 className="font-serif text-5xl text-emerald-950 mb-2 font-bold italic">Editions Limitées</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#C9A84C]/80">Gestion des collections thématiques</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="bg-amber-950 text-white px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-amber-900/30 hover:shadow-amber-900/40 transition-all flex items-center gap-3 font-sans"
        >
          <Plus size={18} /> Nouvelle Collection
        </motion.button>
      </header>

      <section className="relative group">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
        <input 
          type="text"
          placeholder="Rechercher une collection..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans">
        <AnimatePresence mode="popLayout">
          {filtered.map((collection) => {
             return (
              <motion.div 
                layout
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group luxury-card overflow-hidden"
              >
                <div className="aspect-[21/9] relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                  {collection.cover_url ? (
                    <img src={collection.cover_url} alt={collection.name_fr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-emerald-950/10">
                      <Layers size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-8">
                     <h3 className="text-white font-serif text-3xl font-bold italic">{collection.name_fr}</h3>
                     <p className="text-white/60 text-xl font-arabic text-right" dir="rtl">{collection.name_ar}</p>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <p className="text-sm text-emerald-950/70 leading-relaxed font-medium line-clamp-2">
                     {collection.description_fr || "Découvrez une sélection exclusive de produits Amouris."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-emerald-950/5">
                     <div className="px-5 py-2.5 bg-amber-50 rounded-[1rem] flex items-center gap-2 border border-amber-100/50">
                        <Box size={14} className="text-amber-600" />
                        <span className="text-[11px] font-black text-amber-900 uppercase tracking-widest">{collection.product_count} RÉFÉRENCES</span>
                     </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(collection)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(collection)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center text-emerald-950/20 font-sans">
          <Layers size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-2xl italic">Aucune collection trouvée.</p>
        </div>
      )}

      <CollectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        collection={editingCollection} 
      />
    </div>
  )
}
