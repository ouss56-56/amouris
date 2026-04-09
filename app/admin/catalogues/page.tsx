'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileUp, FileText, Trash2, CheckCircle2, AlertCircle, Download, FileType } from 'lucide-react'
import { useCataloguesStore, CatalogueFile } from '@/store/catalogues.store'
import { toast } from 'sonner'

export default function CataloguesPage() {
  const { catalogues, uploadCatalogue, deleteCatalogue } = useCataloguesStore()
  const [isUploading, setIsUploading] = useState<string | null>(null)

  const handleUpload = async (type: 'parfums' | 'flacons', file: File) => {
    try {
      setIsUploading(type)
      await uploadCatalogue(type, file)
      toast.success('Catalogue mis à jour avec succès.')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload.')
    } finally {
      setIsUploading(null)
    }
  }

  const parfumsCat = catalogues.find(c => c.type === 'parfums')
  const flaconsCat = catalogues.find(c => c.type === 'flacons')

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-serif font-black text-emerald-950">Gestion des Catalogues</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C] mt-2">Documents PDF à télécharger par les clients</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CatalogueCard 
          type="parfums" 
          title="Catalogue Parfums" 
          subtitle="Toutes nos fragrances et huiles"
          catalogue={parfumsCat} 
          onUpload={(f) => handleUpload('parfums', f)}
          onDelete={() => deleteCatalogue(parfumsCat!.id)}
          isUploading={isUploading === 'parfums'}
        />
        <CatalogueCard 
          type="flacons" 
          title="Catalogue Flacons" 
          subtitle="Verrerie, bouchons et accessoires"
          catalogue={flaconsCat} 
          onUpload={(f) => handleUpload('flacons', f)}
          onDelete={() => deleteCatalogue(flaconsCat!.id)}
          isUploading={isUploading === 'flacons'}
        />
      </div>

      <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-200 flex items-start gap-4">
         <AlertCircle className="text-amber-600 shrink-0" />
         <div className="text-xs text-amber-900 space-y-2">
            <p className="font-bold uppercase tracking-widest">Informations Importantes</p>
            <p>Les catalogues sont stockés localement dans le navigateur (localStorage). En raison de la limite de stockage, chaque fichier ne doit pas dépasser **5 MB**.</p>
            <p>Si vous changez de navigateur ou nettoyez vos données, vous devrez ré-uploader les catalogues.</p>
         </div>
      </div>
    </div>
  )
}

function CatalogueCard({ 
  type, title, subtitle, catalogue, onUpload, onDelete, isUploading 
}: { 
  type: string, title: string, subtitle: string, catalogue?: CatalogueFile, onUpload: (f: File) => void, onDelete: () => void, isUploading: boolean 
}) {
  return (
    <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-sm overflow-hidden flex flex-col h-full">
       <div className="p-8 border-b border-emerald-950/5 bg-neutral-50/50">
          <h2 className="text-xl font-serif font-bold text-emerald-950">{title}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20">{subtitle}</p>
       </div>

       <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          {catalogue ? (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-4 w-full"
            >
               <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto">
                  <FileText size={40} />
               </div>
               <div>
                  <p className="font-bold text-emerald-950 truncate max-w-[200px] mx-auto">{catalogue.filename}</p>
                  <p className="text-[10px] text-emerald-950/30 uppercase font-black">{catalogue.file_size_kb} KB • {new Date(catalogue.uploaded_at).toLocaleDateString()}</p>
               </div>
               <div className="flex gap-2 justify-center">
                  <a href={catalogue.file_data} download={catalogue.filename} className="h-10 px-4 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-800 transition-all">
                     <Download size={14} /> Télécharger
                  </a>
                  <button onClick={onDelete} className="h-10 px-4 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-all">
                     <Trash2 size={14} /> Supprimer
                  </button>
               </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
               <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-200 mx-auto">
                  <FileType size={40} />
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/20 mb-4">Aucun fichier en ligne</p>
                  <label className="cursor-pointer group">
                     <input 
                       type="file" 
                       accept="application/pdf" 
                       className="hidden" 
                       onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                       disabled={isUploading}
                     />
                     <div className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-[#C9A84C] transition-all shadow-xl shadow-emerald-950/10">
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                        Sélectionner PDF
                     </div>
                  </label>
               </div>
            </div>
          )}
       </div>
    </div>
  )
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <div className={`border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} style={{ width: size, height: size }} />
  )
}
