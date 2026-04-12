"use client";

import { useI18n } from '@/i18n/i18n-context';
import { useState, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';



import { createClient } from '@/lib/supabase/client';

export function AnnouncementBar({ initialAnnouncements = [], settings }: { initialAnnouncements?: any[], settings?: any }) {
  const { language } = useI18n();
  const freeDeliveryThreshold = settings?.free_shipping_threshold || 50000;
  
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScroll = useRef(0);

  // 1. Realtime Subscription
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('public:announcements')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcements' 
      }, async () => {
        // Fetch fresh data when something changes
        const { data } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (data) setAnnouncements(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Get and process active announcements
  const activeAnnouncements = useMemo(() => {
    const activeOnes = announcements.filter((a: any) => a.is_active !== false);
    
    if (activeOnes.length === 0) {
      // Fallback if no announcements are configured
      return [{
        fr: `Livraison gratuite dès ${freeDeliveryThreshold.toLocaleString()} DZD`,
        ar: `توصيل مجاني ابتداءً من ${freeDeliveryThreshold.toLocaleString()} دج`,
        link: "/shop"
      }];
    }

    return activeOnes.map((ann: any) => ({
      fr: (ann.text_fr || '').replace('{{threshold}}', freeDeliveryThreshold.toLocaleString()),
      ar: (ann.text_ar || '').replace('{{threshold}}', freeDeliveryThreshold.toLocaleString()),
      link: null 
    }));
  }, [announcements, freeDeliveryThreshold]);

  // 2. Logic for dismissable
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

  // 3. Auto-scroll logic
  useEffect(() => {
    if (!isVisible || activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, activeAnnouncements.length]);

  // 4. Reset index if list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeAnnouncements.length]);

  // 5. Scroll-aware logic
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const isVisibleNow = current < lastScroll.current || current < 60;
      setHeaderVisible(isVisibleNow);
      lastScroll.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || activeAnnouncements.length === 0) return null;

  const currentMsg = activeAnnouncements[currentIndex];
  const text = language === 'ar' ? currentMsg.ar : currentMsg.fr;

  return (
    <div 
      className={`bg-emerald-900 text-white py-2 px-4 transition-transform duration-300 relative z-[60] overflow-hidden ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between min-h-[24px]">
        <div className="w-8 hidden sm:block" /> 

        <div className="flex-1 text-center overflow-hidden">
          <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-1 duration-500">
            {currentMsg.link ? (
              <Link href={currentMsg.link} className="text-xs md:text-sm font-light tracking-wide hover:underline decoration-amber-400 underline-offset-4">
                {text}
              </Link>
            ) : (
              <span className="text-xs md:text-sm font-light tracking-wide">
                {text}
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fermer l'annonce"
        >
          <X size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}

