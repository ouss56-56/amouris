"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import ar from './ar.json';
import fr from './fr.json';

type Language = 'ar' | 'fr';
type Translations = typeof ar;

interface I18nContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedLang = localStorage.getItem('amouris-language') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('amouris-language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const t = (path: string) => {
    const keys = path.split('.');
    const translations: any = language === 'ar' ? ar : fr;
    
    let current = translations;
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in ${language}`);
        return path;
      }
      current = current[key];
    }
    return current as string;
  };

  const currentDir = language === 'ar' ? 'rtl' : 'ltr';

  const contextValue = {
    language,
    t,
    setLanguage,
    dir: currentDir as 'rtl' | 'ltr'
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}


export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
