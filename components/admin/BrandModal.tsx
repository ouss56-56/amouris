'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Brand } from '@/store/brands.store'
import { Upload, X, Loader2, Store, ChevronRight, Info, Sparkles, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createBrand, updateBrand } from '@/lib/api/brands'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface BrandModalProps {
  brand?: Brand | null
  isOpen: boolean
  onClose: () => void
}

const supabase = createClient()

export function BrandModal({ brand, isOpen, onClose }: BrandModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    name_ar: '',
    logo_url: '',
    description_fr: ''
  })

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        name_ar: brand.name_ar || '',
        logo_url: brand.logo_url || '',
        description_fr: brand.description_fr || ''
      })
    } else {
      setFormData({
        name: '',
        name_ar: '',
        logo_url: '',
        description_fr: ''
      })
    }
  }, [brand, isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `brands/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('brands')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('brands')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
      toast.success('Logo téléchargé avec succès')
    } catch (err: any) {
      toast.error("Erreur d'upload: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
        if (brand?.id) {
          await updateBrand(brand.id, formData)
          toast.success('Maison de parfum mise à jour')
        } else {
          await createBrand(formData as any)
          toast.success('Nouvelle Maison intégrée avec succès')
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
        <div className="bg-[#0a3d2e] p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -mr-20 -mt-20" />
           <DialogHeader className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                 <Store size={28} className="text-[#C9A84C]" />
              </div>
              <div>
                 <DialogTitle className="font-serif text-3xl font-bold italic tracking-tight">
                   {brand ? 'Éditer la Maison' : 'Nouvelle Maison Master'}
                 </DialogTitle>
                 <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Gestion des Partenaires de Luxe</p>
              </div>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-6 p-10 bg-neutral-100/40 rounded-[2.5rem] border border-emerald-950/5 relative group">
            <div className="absolute top-4 right-4 text-[#C9A84C]">
               <Sparkles size={16} />
            </div>
            
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/20">Identité Visuelle</label>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                {formData.logo_url ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-36 h-36 rounded-[2.5rem] border-2 border-white shadow-2xl overflow-hidden group/logo bg-white"
                  >
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-300 backdrop-blur-sm">
                      <button 
                         type="button" 
                         onClick={() => setFormData({ ...formData, logo_url: '' })}
                         className="p-3 hover:scale-110 transition-transform"
                      >
                         <X size={28}/>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.label 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-36 h-36 rounded-[2.5rem] border-2 border-dashed border-emerald-950/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#C9A84C]/40 transition-all bg-neutral-100/50 shadow-inner group/upload"
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-950/20 group-hover/upload:text-[#C9A84C] group-hover/upload:scale-110 transition-all">
                       {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30 mt-3">{isUploading ? 'Transfert...' : 'Import Logo'}</span>
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
                   <Info size={12} /> Nom Commercial (FR)
                </label>
                <input 
                   required 
                   placeholder="Ex: Chanel"
                   value={formData.name} 
                   onChange={e => setFormData({ ...formData, name: e.target.value })} 
                   className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-serif text-xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all" 
                />
              </div>
              <div className="space-y-4 text-right">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                   الاسم الرسمي <AlertCircle size={12} />
                </label>
                <input 
                   required 
                   placeholder="الاسم كامل"
                   value={formData.name_ar} 
                   onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                   dir="rtl" 
                   className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 block">Notes de la Maison (Interne)</label>
              <textarea 
                 value={formData.description_fr} 
                 onChange={e => setFormData({ ...formData, description_fr: e.target.value })} 
                 rows={3} 
                 placeholder="Détails sur le partenariat, l'origine des essences..."
                 className="w-full p-8 rounded-[2.5rem] bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950/70 shadow-sm transition-all resize-none leading-relaxed italic placeholder:opacity-30" 
              />
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row gap-4">
             <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 h-16 rounded-2xl border border-emerald-950/5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-950/30 hover:bg-neutral-50 hover:text-emerald-950 transition-all"
             >
                Abandonner
             </button>
             <button 
                type="submit" 
                disabled={isLoading || isUploading} 
                className="flex-[2] h-16 bg-[#0a3d2e] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
             >
               {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span>{brand ? 'Valider les changements' : 'Inscrire la Maison'}</span>
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
