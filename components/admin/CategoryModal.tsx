'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  X, Loader2, Tag, ChevronRight, Info, 
  Sparkles, Edit3, Type, Globe, Hash
} from 'lucide-react'
import { createCategory, updateCategory } from '@/lib/api/catalogue'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface CategoryModalProps {
  category?: any | null
  isOpen: boolean
  onClose: () => void
}

export function CategoryModal({ category, isOpen, onClose }: CategoryModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details'>('details')

  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    slug: '',
    description_fr: ''
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name_fr: category.name_fr || '',
        name_ar: category.name_ar || '',
        slug: category.slug || '',
        description_fr: category.description_fr || ''
      })
    } else {
      setFormData({
        name_fr: '',
        name_ar: '',
        slug: '',
        description_fr: ''
      })
    }
  }, [category, isOpen])

  // Auto-slug
  useEffect(() => {
    if (!category && formData.name_fr) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name_fr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }))
    }
  }, [formData.name_fr, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
        if (category?.id) {
          await updateCategory(category.id, formData)
          toast.success('Catégorie mise à jour')
        } else {
          await createCategory(formData as any)
          toast.success('Nouvelle Catégorie créée')
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
      <DialogContent className="max-w-[800px] w-[95vw] h-[70vh] bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] font-sans overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <div className="md:w-[280px] bg-emerald-950 text-white p-10 flex flex-col relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -mr-20 -mt-20" />
          
          <div className="relative z-10 flex-1">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner mb-8">
              <Tag size={28} className="text-[#C9A84C]" />
            </div>
            
            <h2 className="font-serif text-3xl font-bold italic tracking-tight mb-2">
              {category ? 'Éditer l\'Açnaf' : 'Nouvelle Catégorie'}
            </h2>
            <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-[0.4em] mb-12">Structure du Catalogue Amouris</p>

            <button
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#C9A84C] text-white shadow-lg shadow-emerald-400/20"
            >
              <Edit3 size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Détails de l'Açnaf</span>
            </button>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
             <div className="flex items-center gap-4 text-emerald-100/20">
                <Sparkles size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">
                   Définissez les piliers de votre navigation.
                </p>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
            <form id="category-form" onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                       <Type size={12} /> Nom de Catégorie (FR)
                    </label>
                    <input 
                       required 
                       placeholder="Ex: Parfums de Niche"
                       value={formData.name_fr} 
                       onChange={e => setFormData({ ...formData, name_fr: e.target.value })} 
                       className="w-full h-16 px-8 rounded-2xl bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-lg" 
                    />
                  </div>
                  <div className="space-y-4 text-right">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                       اسم الصنف (بالعربية) <Globe size={12} />
                    </label>
                    <input 
                       required 
                       placeholder="الصنف"
                       value={formData.name_ar} 
                       onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                       dir="rtl" 
                       className="w-full h-16 px-8 rounded-2xl bg-[#FBFBFB] border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 block flex items-center gap-2">
                    <Hash size={12} /> Identifiant URL (Slug)
                  </label>
                  <input 
                    required 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} 
                    className="w-full h-14 px-8 rounded-xl bg-neutral-100 border border-emerald-950/5 font-mono text-sm text-emerald-950 outline-none" 
                  />
                </div>
              </div>
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
              form="category-form"
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-16 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <span>{category ? 'Enregistrer' : 'Créer l\'Açnaf'}</span>
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
