'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTagsStore, Tag } from '@/store/tags.store'
import { 
  X, Loader2, Bookmark, Check, ChevronRight, Info, 
  Sparkles, LayoutGrid, AlertCircle, Edit3, 
  Settings2, Hash, Type, Globe
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'details' | 'display'>('details')

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
    setActiveTab('details')
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
      <DialogContent className="max-w-[900px] w-[95vw] h-[80vh] bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] font-sans overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <div className="md:w-[320px] bg-[#0a3d2e] text-white p-10 flex flex-col relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -mr-20 -mt-20" />
          
          <div className="relative z-10 flex-1">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner mb-8">
              <Bookmark size={28} className="text-[#C9A84C]" />
            </div>
            
            <h2 className="font-serif text-3xl font-bold italic tracking-tight mb-2">
              {tag ? 'Éditer le Tag' : 'Nouveau Tag'}
            </h2>
            <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-[0.4em] mb-12">Attributs Olfactifs Amouris</p>

            <div className="space-y-4">
              {[
                { id: 'details', label: 'Libellés & Slug', icon: Type },
                { id: 'display', label: 'Affichage & Ordre', icon: Settings2 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#C9A84C] text-white shadow-lg shadow-emerald-400/20' : 'text-white/40 hover:bg-white/5'}`}
                >
                  <tab.icon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
             <div className="flex items-center gap-4 text-emerald-100/20">
                <Sparkles size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">
                   Les tags permettent de segmenter vos produits de manière thématique.
                </p>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
            <form id="tag-form" onSubmit={handleSubmit} className="space-y-12">
              <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                           <Info size={12} /> Libellé (FR)
                        </label>
                        <input 
                           required 
                           placeholder="Ex: Collection d'Été"
                           value={formData.name_fr} 
                           onChange={e => setFormData({ ...formData, name_fr: e.target.value })} 
                           className="w-full h-16 px-8 rounded-2xl bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-lg" 
                        />
                      </div>
                      <div className="space-y-4 text-right">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                           التسمية (بالعربية) <Globe size={12} />
                        </label>
                        <input 
                           required 
                           placeholder="الاسم"
                           value={formData.name_ar} 
                           onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                           dir="rtl" 
                           className="w-full h-16 px-8 rounded-2xl bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right" 
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 block flex items-center gap-2">
                        <Hash size={12} />Identifiant URL (Slug)
                      </label>
                      <div className="relative">
                         <input 
                            required 
                            value={formData.slug} 
                            onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} 
                            className="w-full h-14 px-8 rounded-xl bg-neutral-100 border border-emerald-950/5 font-mono text-sm text-emerald-950 outline-none" 
                         />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-900">
                            <Check size={18} />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="p-10 bg-[#FBFBFB] rounded-[3rem] border border-emerald-950/5 space-y-10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                             Mise en avant <Sparkles size={14} className="text-[#C9A84C]" />
                          </p>
                          <p className="text-[9px] text-emerald-950/40 uppercase tracking-[0.3em] font-black">Afficher sur la Homepage</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, show_on_homepage: !formData.show_on_homepage })}
                          className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${formData.show_on_homepage ? 'bg-[#C9A84C]' : 'bg-neutral-300'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all transform ${formData.show_on_homepage ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {formData.show_on_homepage && (
                        <div className="space-y-4 pt-6 border-t border-emerald-950/5">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C] px-1 flex items-center gap-2">
                             Ordre de priorité
                          </label>
                          <input 
                             type="number" 
                             value={formData.homepage_order} 
                             onChange={e => setFormData({ ...formData, homepage_order: +e.target.value })} 
                             className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 outline-none font-bold text-emerald-950 text-xl shadow-inner focus:border-[#C9A84C] transition-all" 
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="p-10 bg-[#FBFBFB] border-t border-emerald-950/5 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 h-16 rounded-2xl border border-emerald-950/5 text-[10px] font-black uppercase tracking-widest text-emerald-950/30 hover:bg-neutral-50 hover:text-emerald-950 transition-all font-sans"
            >
              Annuler
            </button>
            <button 
              form="tag-form"
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-16 bg-[#0a3d2e] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <span>{tag ? 'Enregistrer les modifications' : 'Consacrer le Nouveau Tag'}</span>
                  <ChevronRight size={18} className="text-[#C9A84C] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
