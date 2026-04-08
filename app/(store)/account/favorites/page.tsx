'use client';

import { useI18n } from '@/i18n/i18n-context';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FavoritesPage() {
  const { language } = useI18n();
  const isAr = language === 'ar';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-xl shadow-rose-950/5"
      >
        <Heart size={40} fill="currentColor" className="opacity-20" />
      </motion.div>
      
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="font-serif text-3xl text-emerald-950">
          {isAr ? 'قائمة المفضلة' : 'Mes Favoris'}
        </h1>
        <p className="text-emerald-950/40 text-sm leading-relaxed">
          {isAr 
            ? 'هذه الميزة ستكون متوفرة قريباً. ستتمكن من حفظ أفضل مقتنياتك هنا.' 
            : 'Cette fonctionnalité sera bientôt disponible. Vous pourrez sauvegarder vos essences favorites ici.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full opacity-10 grayscale pointer-events-none">
         {[1,2,3,4].map(i => (
           <div key={i} className="aspect-square bg-emerald-900 rounded-3xl" />
         ))}
      </div>
    </div>
  );
}
