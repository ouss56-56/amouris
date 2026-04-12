'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Bookmark, 
  Home, 
  ListOrdered,
  Box 
} from 'lucide-react'
import { TagModal } from '@/components/admin/TagModal'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTagAction, updateTagAction } from '@/lib/actions/tags'

interface TagsClientProps {
  initialTags: any[]
  initialProducts: any[]
}

export default function TagsClient({ initialTags, initialProducts }: TagsClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any | null>(null)

  const filtered = initialTags.filter(t => 
    t.name_fr.toLowerCase().includes(search.toLowerCase()) || 
    (t.name_ar && t.name_ar.includes(search))
  )

  const handleAdd = () => {
    setEditingTag(null)
    setModalOpen(true)
  }

  const handleEdit = (t: any) => {
    setEditingTag(t)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce tag ?')) {
      try {
        const result = await deleteTagAction(id)
        if (result.success) {
          router.refresh()
          toast.success('Tag supprimé')
        } else {
          toast.error('Erreur: ' + result.error)
        }
      } catch (err: any) {
        toast.error('Erreur: ' + err.message)
      }
    }
  }

  const toggleHomepage = async (tag: any) => {
    try {
      const result = await updateTagAction(tag.id, { show_on_homepage: !tag.show_on_homepage })
      if (result.success) {
        router.refresh()
        toast.success('Statut mis à jour')
      } else {
        toast.error('Erreur: ' + result.error)
      }
    } catch (err: any) {
      toast.error('Erreur: ' + err.message)
    }
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bold italic">Les Wossoum</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Tags, Labels et Sections Homepage</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-emerald-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 font-sans"
        >
          <Plus size={16} /> Nouveau Tag
        </button>
      </header>

      <section className="relative group">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
        <input 
          type="text"
          placeholder="Rechercher par label..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
        />
      </section>

      <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden font-sans">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Label / Slug</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Usage</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Homepage</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Ordre</th>
                <th className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Contrôles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((tag) => {
                  const count = initialProducts.filter(p => (p.tag_ids || []).includes(tag.id)).length
                  return (
                    <motion.tr 
                      layout
                      key={tag.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white transition-all">
                             <Bookmark size={20} />
                          </div>
                          <div>
                            <p className="font-serif text-lg text-emerald-950 font-bold italic">{tag.name_fr}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 italic">#{tag.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-2">
                            <Box size={14} className="text-emerald-900/20" />
                            <span className="text-xs font-bold text-emerald-950/60">{count} Produits liés</span>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                         <button 
                           onClick={() => toggleHomepage(tag)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tag.show_on_homepage ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-neutral-100 text-neutral-400'}`}
                         >
                           <Home size={12} />
                           {tag.show_on_homepage ? 'Activé' : 'Désactivé'}
                         </button>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-2 font-mono">
                            <ListOrdered size={14} className="text-emerald-900/20" />
                            <span className="text-sm font-bold text-emerald-950">{tag.homepage_order || 0}</span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(tag)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                               <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(tag.id)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center text-emerald-950/20">
          <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-2xl italic">Aucun tag trouvé.</p>
        </div>
      )}

      <TagModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        tag={editingTag} 
      />
    </div>
  )
}
