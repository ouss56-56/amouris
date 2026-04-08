'use client'

import { useState, useEffect } from 'react'
import { useCollectionsStore, Collection } from '@/store/collections.store'
import { useProductsStore } from '@/store/products.store'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Layers, Loader2, Image as ImageIcon, Box } from 'lucide-react'
import { CollectionModal } from '@/components/admin/CollectionModal'

export default function AdminCollectionsPage() {
  const { collections, fetchCollections, remove, isLoading } = useCollectionsStore()
  const { products, fetchProducts } = useProductsStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  useEffect(() => {
    fetchCollections()
    fetchProducts()
  }, [fetchCollections, fetchProducts])

  const filtered = collections.filter(c => 
    c.name_fr.toLowerCase().includes(search.toLowerCase()) || 
    c.name_ar.includes(search)
  )

  const handleAdd = () => {
    setEditingCollection(null)
    setModalOpen(true)
  }

  const handleEdit = (c: Collection) => {
    setEditingCollection(c)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette collection ?')) {
      try {
        await remove(id)
      } catch (err) {
        alert('Erreur lors de la suppression')
      }
    }
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2">Éditions Limitées</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Gestion des collections thématiques</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-amber-950 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-amber-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={16} /> Nouvelle Collection
        </button>
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

      {isLoading && collections.length === 0 ? (
        <div className="py-32 flex justify-center">
          <Loader2 className="animate-spin text-amber-900" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <AnimatePresence mode="popLayout">
            {filtered.map((collection) => {
               const count = products.filter(p => p.collection_id === collection.id).length
               return (
                <motion.div 
                  layout
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-[3rem] border border-emerald-950/5 shadow-xl shadow-emerald-950/5 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all overflow-hidden"
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
                       <h3 className="text-white font-serif text-3xl font-bold">{collection.name_fr}</h3>
                       <p className="text-white/60 text-xl font-arabic" dir="rtl">{collection.name_ar}</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <p className="text-xs text-emerald-950/60 leading-relaxed font-medium line-clamp-2">
                       {collection.description_fr || "Découvrez une sélection exclusive de produits Amouris."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-emerald-950/5">
                      <div className="px-4 py-2 bg-amber-50 rounded-xl flex items-center gap-2">
                         <Box size={12} className="text-amber-600" />
                         <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">{count} RÉFÉRENCES</span>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(collection)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(collection.id)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
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
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-32 text-center text-emerald-950/20">
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
