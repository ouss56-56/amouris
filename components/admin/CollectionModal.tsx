'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Collection } from '@/store/collections.store'
import { 
  Upload, X, Loader2, Layers, ChevronRight, Info, 
  Image as ImageIcon, Sparkles, AlertCircle, Edit3,
  LayoutGrid, Globe, Type
} from 'lucide-react'
import { uploadImage } from '@/lib/actions/storage'
import { createCollection, updateCollection } from '@/lib/api/catalogue'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface CollectionModalProps {
  collection?: Collection | null
  isOpen: boolean
  onClose: () => void
}

export function CollectionModal({ collection, isOpen, onClose }: CollectionModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details')

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
    setActiveTab('details')
  }, [collection, isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const buffer = await file.arrayBuffer()
      const publicUrl = await uploadImage({
        name: file.name,
        type: file.type,
        buffer: buffer
      }, 'collections')

      setFormData(prev => ({ ...prev, cover_url: publicUrl }))
      toast.success('Image de couverture enregistrée')
    } catch (err: any) {
      toast.error("Échec du transfert: " + err.message)
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
          toast.success('Collection mise à jour avec succès')
        } else {
          await createCollection(formData as any)
          toast.success('Nouvelle Collection créée')
        }
        router.refresh()
        onClose()
    } catch (err: any) {
        toast.error('Erreur: ' + err.message)
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] w-[95vw] h-[85vh] bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] font-sans overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar - Premium Design */}
        <div className="md:w-[350px] bg-[#1a1104] text-white p-10 flex flex-col relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-[80px] -mr-20 -mt-20" />
          
          <div className="relative z-10 flex-1">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner mb-8">
              <Layers size={28} className="text-[#C9A84C]" />
            </div>
            
            <h2 className="font-serif text-3xl font-bold italic tracking-tight mb-2">
              {collection ? 'Éditer l\'Édition' : 'Nouvelle Édition'}
            </h2>
            <p className="text-amber-100/30 text-[9px] font-black uppercase tracking-[0.4em] mb-12">Curation Collective Amouris</p>

            <div className="space-y-4">
              {[
                { id: 'details', label: 'Détails & Identité', icon: Edit3 },
                { id: 'media', label: 'Visuel Sacré', icon: ImageIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#C9A84C] text-white shadow-lg shadow-[#C9A84C]/20' : 'text-white/40 hover:bg-white/5'}`}
                >
                  <tab.icon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
             <div className="flex items-center gap-4 text-amber-100/20">
                <LayoutGrid size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">
                   Les éditions limitées sont mises en avant dans le catalogue global.
                </p>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
            <form id="collection-form" onSubmit={handleSubmit} className="space-y-12">
              <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                           <Type size={12} /> Titre de l'Édition (FR)
                        </label>
                        <input 
                           required 
                           placeholder="Ex: Collection d'Été 2024"
                           value={formData.name_fr} 
                           onChange={e => setFormData({ ...formData, name_fr: e.target.value })} 
                           className="w-full h-16 px-8 rounded-2xl bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-serif text-xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all" 
                        />
                      </div>
                      
                      <div className="space-y-4 text-right">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                           عنوان المجموعة بالعربية <Globe size={12} />
                        </label>
                        <input 
                           required 
                           placeholder="اسم التشكيلة"
                           value={formData.name_ar} 
                           onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                           dir="rtl" 
                           className="w-full h-16 px-8 rounded-2xl bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right" 
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                         <Info size={12} /> Description Narratibe (FR)
                      </label>
                      <textarea 
                         value={formData.description_fr} 
                         onChange={e => setFormData({ ...formData, description_fr: e.target.value })} 
                         rows={4} 
                         placeholder="Racontez l'histoire de cette collection..."
                         className="w-full p-8 rounded-[2.5rem] bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950/70 shadow-sm transition-all resize-none leading-relaxed italic" 
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="media"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border-2 border-dashed border-emerald-950/5 bg-[#FBFBFB] relative group">
                        <AnimatePresence mode="wait">
                          {formData.cover_url ? (
                            <motion.div key="img" className="w-full h-full">
                              <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <button type="button" onClick={() => setFormData({ ...formData, cover_url: '' })} className="p-4 bg-white/10 rounded-full hover:bg-rose-600 transition-colors">
                                  <X size={24} className="text-white" />
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.label key="upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors">
                              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-emerald-900 mb-4">
                                {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                              </div>
                              <p className="font-serif text-xl italic text-emerald-950">Importer le visuel de couverture</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#C9A84C] mt-2">Format Recommandé: 21:9</p>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                            </motion.label>
                          )}
                        </AnimatePresence>
                      </div>
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
              className="px-8 h-16 rounded-2xl border border-emerald-950/5 text-[10px] font-black uppercase tracking-widest text-emerald-950/30 hover:bg-neutral-50 hover:text-emerald-950 transition-all"
            >
              Fermer
            </button>
            <button 
              form="collection-form"
              type="submit" 
              disabled={isLoading || isUploading}
              className="flex-1 h-16 bg-[#1a1104] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-amber-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <span>{collection ? 'Sauvegarder les modifications' : 'Publier la Collection'}</span>
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
