"use client";

import { useI18n } from '@/i18n/i18n-context';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { useSettingsStore } from '@/store/settings.store';

export function AnnouncementBar() {
  const { language } = useI18n();
  const settings = useSettingsStore();
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const announcements = [
    {
      fr: `Livraison gratuite pour les commandes de plus de ${settings.freeDeliveryThreshold.toLocaleString()} DZD`,
      ar: `توصيل مجاني للطلبات التي تزيد عن ${settings.freeDeliveryThreshold.toLocaleString()} دج`,
      link: "/shop"
    },
    {
      fr: "Nouveaux arrivages de flacons de luxe disponible",
      ar: "وصلت حديثا تشكيلة مميزة من القوارير الفاخرة",
      link: "/shop/flacons"
    },
    {
      fr: "Amouris Parfums - Excellence & Tradition",
      ar: "أموريس للعطور - تميز وأصالة",
      link: null
    }
  ];

  // 1. Logic for dismissable
  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-dismissed', 'true');
  };

  // 2. Auto-scroll logic
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  // 3. Scroll-aware logic (matches header)
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHeaderVisible(current < lastScroll || current < 60);
      setLastScroll(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  if (!isVisible) return null;

  const currentMsg = announcements[currentIndex];
  const text = language === 'ar' ? currentMsg.ar : currentMsg.fr;

  return (
    <div 
      className={`bg-emerald-900 text-white py-2 px-4 transition-transform duration-300 relative z-[60] overflow-hidden ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between min-h-[24px]">
        {/* Helper for centering - only if needed or just use flex-1 */}
        <div className="w-8 hidden sm:block" /> 

        <div className="flex-1 text-center overflow-hidden">
          <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-1 duration-500">
            {currentMsg.link ? (
              <Link href={currentMsg.link} className="text-[11px] md:text-sm font-light tracking-wide hover:underline decoration-amber-400 underline-offset-4">
                {text}
              </Link>
            ) : (
              <span className="text-[11px] md:text-sm font-light tracking-wide">
                {text}
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fermer l'annonce"
        >
          <X size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}

