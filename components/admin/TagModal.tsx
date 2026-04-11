'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTagsStore, Tag } from '@/store/tags.store'
import { X, Loader2, Bookmark, Check, ChevronRight, Info, Sparkles, LayoutGrid, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
          toast.success('Le Wossoum a été mis à jour')
        } else {
          await addTag(formData as any)
          toast.success('Nouveau Wossoum créé avec succès')
        }
        onClose()
    } catch (err: any) {
        toast.error('Échec de la sauvegarde: ' + err.message)
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] font-sans overflow-hidden">
        <div className="bg-[#0a3d2e] p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -mr-20 -mt-20" />
           <DialogHeader className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                 <Bookmark size={28} className="text-[#C9A84C]" />
              </div>
              <div>
                 <DialogTitle className="font-serif text-3xl font-bold italic tracking-tight">
                   {tag ? 'Éditer le Wossoum' : 'Nouveau Wossoum Sacré'}
                 </DialogTitle>
                 <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Attributs & Distinctions Olfactives</p>
              </div>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                   <Info size={12} /> Libellé (FR)
                </label>
                <input 
                   required 
                   placeholder="Ex: Intense"
                   value={formData.name_fr} 
                   onChange={e => setFormData({ ...formData, name_fr: e.target.value })} 
                   className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-lg" 
                />
              </div>
              <div className="space-y-4 text-right">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                   التسمية بالعربية <AlertCircle size={12} />
                </label>
                <input 
                   required 
                   placeholder="الوسم"
                   value={formData.name_ar} 
                   onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                   dir="rtl" 
                   className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 block">Identifiant URL technique</label>
              <div className="relative">
                 <input 
                    required 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} 
                    className="w-full h-12 px-8 rounded-xl bg-neutral-100 border border-emerald-950/5 font-mono text-xs text-emerald-950/40 outline-none" 
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-950/10">
                    <Check size={14} />
                 </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-neutral-100/40 rounded-[2.5rem] border border-emerald-950/5 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-emerald-900/5 group-hover:text-emerald-900/10 transition-colors">
               <LayoutGrid size={64} />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                   Mise en avant <Sparkles size={14} className="text-[#C9A84C]" />
                </p>
                <p className="text-[9px] text-emerald-950/40 uppercase tracking-[0.3em] font-black">Visibilité Section Homepage</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, show_on_homepage: !formData.show_on_homepage })}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${formData.show_on_homepage ? 'bg-[#C9A84C]' : 'bg-neutral-300 shadow-inner'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all transform ${formData.show_on_homepage ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <AnimatePresence>
              {formData.show_on_homepage && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 pt-6 border-t border-emerald-950/5 relative z-10 overflow-hidden"
                >
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C] px-1 flex items-center gap-2">
                     Priorité d&apos;affichage (0-100)
                  </label>
                  <input 
                     type="number" 
                     value={formData.homepage_order} 
                     onChange={e => setFormData({ ...formData, homepage_order: +e.target.value })} 
                     className="w-full h-14 px-6 rounded-2xl bg-white border border-emerald-950/5 outline-none font-bold text-emerald-950 shadow-sm" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-10 flex flex-col md:flex-row gap-4">
             <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 h-16 rounded-2xl border border-emerald-950/5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-950/30 hover:bg-neutral-50 hover:text-emerald-950 transition-all font-sans"
             >
                Abandonner
             </button>
             <button 
                type="submit" 
                disabled={isLoading} 
                className="flex-[2] h-16 bg-[#0a3d2e] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
             >
               {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span>{tag ? 'Enregistrer le Wossoum' : 'Consacrer le Nouveau Tag'}</span>
                    <ChevronRight size={18} className="text-[#C9A84C] group-hover:translate-x-1 transition-transform" />
                  </>
               )}
             </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
