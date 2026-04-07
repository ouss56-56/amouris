'use client'

import { useState, useMemo } from 'react'
import { wilayas } from '@/lib/wilayas'
import { useI18n } from '@/i18n/i18n-context'
import { Search, MapPin, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface WilayaSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function WilayaSelector({ value, onValueChange }: WilayaSelectorProps) {
  const { language } = useI18n()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredWilayas = useMemo(() => {
    if (!search) return wilayas
    const s = search.toLowerCase()
    return wilayas.filter(w => 
      w.name.toLowerCase().includes(s) || 
      w.nameAR.includes(s) || 
      w.id.toString().includes(s)
    )
  }, [search])

  const selectedWilaya = wilayas.find(w => w.name === value)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between h-12 px-4 font-normal rounded-none border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-sm"
        >
          {selectedWilaya ? (
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-amber-500" />
              <span className="font-medium text-emerald-950">
                {selectedWilaya.id} - {language === 'ar' ? selectedWilaya.nameAR : selectedWilaya.name}
              </span>
            </span>
          ) : (
             <span className="text-gray-400">
               {language === 'ar' ? 'اختر الولاية' : 'Choisir la wilaya'}
             </span>
          )}
          <Search size={16} className="text-gray-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] rounded-none p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="font-serif text-xl text-emerald-950">
            {language === 'ar' ? 'اختر ولاية التوصيل' : 'Wilaya de livraison'}
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder={language === 'ar' ? 'ابحث عن الولاية...' : 'Rechercher une wilaya...'}
              className="pl-10 h-12 rounded-none border-emerald-100 focus-visible:ring-emerald-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="p-2">
            {filteredWilayas.length > 0 ? (
              filteredWilayas.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    onValueChange(w.name)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full flex items-center justify-between p-4 text-sm transition-colors rounded-none mb-1 ${value === w.name ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-50 text-emerald-950'}`}
                >
                  <span className="font-medium">
                    {w.id}. {language === 'ar' ? w.nameAR : w.name}
                  </span>
                  {value === w.name && <Check size={16} />}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 italic">
                {language === 'ar' ? 'لم يتم العثور على نتائج' : 'Aucun résultat trouvé'}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
