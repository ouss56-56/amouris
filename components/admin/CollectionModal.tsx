'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCollectionsStore, Collection } from '@/store/collections.store'
import { Upload, X, Loader2, Sparkles, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CollectionModalProps {
  collection?: Collection | null
  isOpen: boolean
  onClose: () => void
}

const supabase = createClient()

export function CollectionModal({ collection, isOpen, onClose }: CollectionModalProps) {
  const { addCollection, updateCollection } = useCollectionsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<Partial<Collection>>({
    name_fr: '',
    name_ar: '',
    description_fr: '',
    cover_url: ''
  })

  useEffect(() => {
    if (collection) {
      setFormData({
        name_fr: collection.name_fr || '',
        name_ar: collection.name_ar || '',
        description_fr: collection.description_fr || '',
        cover_url: collection.cover_url || ''
      })
    } else {
      setFormData({
        name_fr: '',
        name_ar: '',
        description_fr: '',
        cover_url: ''
      })
    }
  }, [collection, isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `collections/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('collections')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('collections')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, cover_url: publicUrl }))
    } catch (err) {
      alert("Erreur upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
        if (collection?.id) {
          await updateCollection(collection.id, formData)
        } else {
          await addCollection(formData as any)
        }
        onClose()
    } catch (err) {
        alert('Erreur lors de la sauvegarde')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
        <div className="bg-amber-950 p-8 text-white relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px]" />
           <DialogHeader>
              <DialogTitle className="font-serif text-2xl flex items-center gap-3 relative z-10">
                <Layers size={24} className="text-[#C9A84C]" />
                {collection ? 'Éditer la Collection' : 'Nouvelle Collection'}
              </DialogTitle>
              <p className="text-amber-100/30 text-[9px] font-black uppercase tracking-[0.3em] mt-1 relative z-10">Éditions Amouris</p>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Image de Couverture</label>
            <div className="relative group/cover aspect-[21/9] rounded-2xl overflow-hidden border border-emerald-950/5 bg-neutral-50/50">
              {formData.cover_url ? (
                <>
                  <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, cover_url: '' })}
                    className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity"
                  >
                    <X size={24}/>
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all">
                  {isUploading ? <Loader2 size={24} className="animate-spin text-emerald-950/20" /> : <Upload size={24} className="text-emerald-950/20 mb-1" />}
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-950/20">{isUploading ? 'Chargement' : 'Upload Cover'}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Français</label>
              <input required value={formData.name_fr} onChange={e => setFormData({ ...formData, name_fr: e.target.value })} className="w-full h-12 px-5 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-bold text-emerald-950 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Arabe</label>
              <input required value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" className="w-full h-12 px-5 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-bold text-emerald-950 transition-all font-arabic" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Description</label>
              <textarea value={formData.description_fr} onChange={e => setFormData({ ...formData, description_fr: e.target.value })} rows={2} className="w-full p-5 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-all resize-none" />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl border border-emerald-950/5 text-[10px] font-black uppercase tracking-widest text-emerald-950/40 hover:bg-neutral-50 transition-colors">Annuler</button>
             <button type="submit" disabled={isLoading || isUploading} className="flex-[2] h-14 bg-amber-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
               {isLoading ? <Loader2 className="animate-spin" size={16} /> : (collection ? 'Enregistrer' : 'Créer la Collection')}
             </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
