'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTagsStore, Tag } from '@/store/tags.store'
import { X, Loader2, Bookmark, Check } from 'lucide-react'

interface TagModalProps {
  tag?: Tag | null
  isOpen: boolean
  onClose: () => void
}

export function TagModal({ tag, isOpen, onClose }: TagModalProps) {
  const { addTag, updateTag } = useTagsStore()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<Tag>>({
    name_fr: '',
    name_ar: '',
    slug: '',
    show_on_homepage: false,
    homepage_order: 0
  })

  useEffect(() => {
    if (tag) {
      setFormData({
        name_fr: tag.name_fr || '',
        name_ar: tag.name_ar || '',
        slug: tag.slug || '',
        show_on_homepage: tag.show_on_homepage || false,
        homepage_order: tag.homepage_order || 0
      })
    } else {
      setFormData({
        name_fr: '',
        name_ar: '',
        slug: '',
        show_on_homepage: false,
        homepage_order: 0
      })
    }
  }, [tag, isOpen])

  // Auto-slug
  useEffect(() => {
    if (!tag && formData.name_fr) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name_fr!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }))
    }
  }, [formData.name_fr, tag])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
        if (tag?.id) {
          await updateTag(tag.id, formData)
        } else {
          await addTag(formData as any)
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
        <div className="bg-emerald-900 p-8 text-white relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px]" />
           <DialogHeader>
              <DialogTitle className="font-serif text-2xl flex items-center gap-3 relative z-10">
                <Bookmark size={24} className="text-[#C9A84C]" />
                {tag ? 'Éditer le Wossoum' : 'Nouveau Wossoum'}
              </DialogTitle>
              <p className="text-emerald-100/30 text-[9px] font-black uppercase tracking-[0.3em] mt-1 relative z-10">Tags & Attributs</p>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Français</label>
              <input required value={formData.name_fr} onChange={e => setFormData({ ...formData, name_fr: e.target.value })} className="w-full h-12 px-5 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-bold text-emerald-950 transition-all font-sans" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Arabe</label>
              <input required value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" className="w-full h-12 px-5 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-bold text-emerald-950 transition-all font-arabic font-arabic" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Slug (URL)</label>
              <input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} className="w-full h-12 px-5 rounded-2xl bg-neutral-100 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-mono text-xs text-emerald-950/50 transition-all" />
            </div>
          </div>

          <div className="space-y-6 p-6 bg-neutral-50 rounded-3xl border border-emerald-950/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-950">Afficher en accueil</p>
                <p className="text-[9px] text-emerald-950/40 uppercase tracking-widest font-black">Section Homepage</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, show_on_homepage: !formData.show_on_homepage })}
                className={`w-12 h-6 rounded-full transition-all relative ${formData.show_on_homepage ? 'bg-emerald-600' : 'bg-neutral-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.show_on_homepage ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {formData.show_on_homepage && (
              <div className="space-y-2 pt-4 border-t border-emerald-950/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Ordre d&apos;affichage</label>
                <input type="number" value={formData.homepage_order} onChange={e => setFormData({ ...formData, homepage_order: +e.target.value })} className="w-full h-10 px-4 rounded-xl bg-white border border-emerald-950/5 outline-none font-bold text-emerald-950" />
              </div>
            )}
          </div>

          <div className="pt-6 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl border border-emerald-950/5 text-[10px] font-black uppercase tracking-widest text-emerald-950/40 hover:bg-neutral-50 transition-colors">Annuler</button>
             <button type="submit" disabled={isLoading} className="flex-[2] h-14 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
               {isLoading ? <Loader2 className="animate-spin" size={16} /> : (tag ? 'Enregistrer' : 'Créer le Tag')}
             </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
