'use client'

import { useState, useEffect, useRef } from 'react'
import { useCategoriesStore, Category } from '@/store/categories.store'
import { Plus, Trash2, Edit2, Search, Package, Image as ImageIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const supabase = createClient()

export default function AdminCategoriesPage() {
  const { categories, fetchCategories, addCategory, updateCategory, deleteCategory, isLoading } = useCategoriesStore()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    slug: '',
    image_url: ''
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Auto slug generation
  useEffect(() => {
    if (!editingCategory && formData.name_fr) {
      const generated = formData.name_fr
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setFormData(prev => ({ ...prev, slug: generated }))
    }
  }, [formData.name_fr, editingCategory])

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name_fr: category.name_fr,
        name_ar: category.name_ar,
        slug: category.slug,
        image_url: category.image_url || ''
      })
    } else {
      setEditingCategory(null)
      setFormData({ name_fr: '', name_ar: '', slug: '', image_url: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await addCategory(formData)
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la sauvegarde de la catégorie")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      await deleteCategory(id)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `categories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('categories')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
    } catch (err) {
      console.error('Upload error:', err)
      alert("Erreur lors de l'upload de l'image")
    } finally {
      setIsUploading(false)
    }
  }

  const filtered = categories.filter(c => 
    c.name_fr.toLowerCase().includes(search.toLowerCase()) || 
    c.name_ar.includes(search)
  )

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bolditalic">Bibliothèque Olfactive</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Gestion des catégories & Univers</p>
        </div>
        <Button 
           onClick={() => handleOpenModal()} 
           className="bg-[#0a3d2e] hover:bg-emerald-900 text-white rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/20"
        >
           <Plus size={16} className="mr-2" /> Nouvelle Catégorie
        </Button>
      </header>

      <section className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
           <input 
             type="text"
             placeholder="Rechercher une catégorie..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
           />
        </div>
      </section>

      {isLoading && !isModalOpen ? (
         <div className="py-20 flex justify-center">
             <Loader2 className="animate-spin text-emerald-900" size={40} />
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((category) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={category.id}
                className="bg-white rounded-[2.5rem] border border-emerald-950/5 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-emerald-950/5 flex items-center justify-center overflow-hidden">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name_fr} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="text-emerald-950/20" size={24} />
                      )}
                   </div>
                   <div className="flex gap-2">
                       <button onClick={() => handleOpenModal(category)} className="w-10 h-10 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-amber-600 transition-colors shadow-sm">
                           <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(category.id)} className="w-10 h-10 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-rose-600 transition-colors shadow-sm">
                           <Trash2 size={16} />
                       </button>
                   </div>
                </div>
                <div className="relative z-10">
                    <h3 className="font-serif text-2xl font-bold text-emerald-950 truncate">{category.name_fr}</h3>
                    <p className="text-sm font-arabic text-emerald-950/40 mt-1 truncate" dir="rtl">{category.name_ar}</p>
                    <div className="mt-6 flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg font-mono">
                            {category.slug}
                        </span>
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="p-32 text-center bg-white rounded-[3rem] border border-emerald-950/5">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-emerald-950/10" />
            </div>
            <p className="text-emerald-950/30 font-serif text-2xl italic">Aucune catégorie trouvée</p>
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-0 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 border-b border-emerald-950/5 flex flex-row items-center justify-between">
            <DialogTitle className="font-serif text-2xl text-emerald-950">
               {editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto w-full no-scrollbar">
            <div className="flex gap-8">
               <div className="w-40 shrink-0">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 mb-3 block">Image</label>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button 
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full aspect-square rounded-[2rem] border-2 border-dashed border-emerald-950/10 flex flex-col items-center justify-center gap-3 bg-neutral-50/50 hover:bg-neutral-50 transition-colors relative overflow-hidden"
                  >
                     {formData.image_url ? (
                        <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <>
                           {isUploading ? <Loader2 className="animate-spin text-emerald-950/20" size={24} /> : <ImageIcon size={24} className="text-emerald-950/20" />}
                           <span className="text-[8px] font-black uppercase tracking-widest text-emerald-950/20">
                             {isUploading ? 'Chargement...' : 'Ajouter'}
                           </span>
                        </>
                     )}
                  </button>
               </div>

               <div className="flex-1 space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Français</label>
                    <input required value={formData.name_fr} onChange={e => setFormData({ ...formData, name_fr: e.target.value })} className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Arabe</label>
                    <input required value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors font-arabic" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Slug (URL)</label>
                    <input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full h-14 px-6 rounded-2xl bg-neutral-100 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-mono text-sm text-emerald-950/60 transition-colors" />
                 </div>
               </div>
            </div>

            <div className="pt-8 border-t border-emerald-950/5 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-14 px-8 border-emerald-950/10 text-emerald-950 uppercase text-[10px] font-black tracking-widest">
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl h-14 px-12 bg-[#0a3d2e] hover:bg-emerald-900 text-white uppercase text-[10px] font-black tracking-widest shadow-xl shadow-emerald-900/20">
                {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {editingCategory ? 'Sauvegarder' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
