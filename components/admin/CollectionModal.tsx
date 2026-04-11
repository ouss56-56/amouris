'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Collection } from '@/store/collections.store'
import { Upload, X, Loader2, Layers, ChevronRight, Info, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createCollection, updateCollection } from '@/lib/api/catalogue'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface CollectionModalProps {
  collection?: Collection | null
  isOpen: boolean
  onClose: () => void
}

const supabase = createClient()

export function CollectionModal({ collection, isOpen, onClose }: CollectionModalProps) {
  const router = useRouter()
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
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `collections/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('collections')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('collections')
        .getPublicUrl(filePath)

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
      <DialogContent className="max-w-2xl bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] font-sans overflow-hidden">
        <div className="bg-[#1a1104] p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-[80px] -mr-20 -mt-20" />
           <DialogHeader className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                 <Layers size={28} className="text-[#C9A84C]" />
              </div>
              <div>
                 <DialogTitle className="font-serif text-3xl font-bold italic tracking-tight">
                   {collection ? 'Éditer l\'Édition' : 'Nouvelle Édition Limitée'}
                 </DialogTitle>
                 <p className="text-amber-100/30 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Curation Collective Amouris</p>
              </div>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Cover Section */}
          <div className="space-y-6">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
               <ImageIcon size={12} /> Visuel de Collection
            </label>
            <div className="relative group/cover aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-emerald-950/5 bg-neutral-100/50 shadow-inner">
              <AnimatePresence mode="wait">
                {formData.cover_url ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#1a1104]/80 text-white flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                      <button 
                         type="button" 
                         onClick={() => setFormData({ ...formData, cover_url: '' })}
                         className="p-4 bg-white/10 rounded-full hover:bg-rose-600 transition-colors"
                      >
                         <X size={24}/>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.label 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all group/upload"
                  >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-950/10 group-hover/upload:text-[#C9A84C] group-hover/upload:scale-110 transition-all">
                       {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/20 mt-4">{isUploading ? 'Traitement de l\'image...' : 'Importer une couverture'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={handleImageUpload} />
                  </motion.label>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                   <Info size={12} /> Titre de l'Édition (FR)
                </label>
                <input 
                   required 
                   placeholder="Ex: Collection d'Été 2024"
                   value={formData.name_fr} 
                   onChange={e => setFormData({ ...formData, name_fr: e.target.value })} 
                   className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-serif text-xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all placeholder:italic placeholder:opacity-20" 
                />
              </div>
              <div className="space-y-4 text-right">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                   عنوان المجموعة <AlertCircle size={12} />
                </label>
                <input 
                   required 
                   placeholder="اسم التشكيلة"
                   value={formData.name_ar} 
                   onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                   dir="rtl" 
                   className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right placeholder:opacity-20" 
                />
              </div>
            </div>

            <div className="space-y-4 relative">
              <div className="absolute top-0 right-4 text-[#C9A84C]/40">
                 <Sparkles size={14} />
              </div>
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 block">Description Narratibe</label>
              <textarea 
                 value={formData.description_fr} 
                 onChange={e => setFormData({ ...formData, description_fr: e.target.value })} 
                 rows={3} 
                 placeholder="Racontez l'histoire de cette collection, son inspiration, son atmosphère..."
                 className="w-full p-8 rounded-[2.5rem] bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950/70 shadow-sm transition-all resize-none leading-relaxed italic placeholder:opacity-30" 
              />
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row gap-4">
             <button 
               type="button" 
               onClick={onClose} 
               className="flex-1 h-16 rounded-2xl border border-emerald-950/5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-950/30 hover:bg-neutral-50 hover:text-emerald-950 transition-all font-sans"
             >
               Annuler
             </button>
             <button 
               type="submit" 
               disabled={isLoading || isUploading} 
               className="flex-[2] h-16 bg-[#1a1104] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-amber-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
             >
               {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span>{collection ? 'Sauvegarder l\'Édition' : 'Publier la Collection'}</span>
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
