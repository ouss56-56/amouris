"use client";

import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'fr' : 'ar');
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline-block font-medium">
        {language === 'ar' ? 'Français' : 'العربية'}
      </span>
    </Button>
  );
}
