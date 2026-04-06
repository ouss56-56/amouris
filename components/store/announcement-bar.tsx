"use client";

import { useI18n } from '@/i18n/i18n-context';

export function AnnouncementBar() {
  const { language, dir } = useI18n();

  // In a real app, this would be fetched from the backend settings
  const messageAR = "توصيل مجاني للطلبات التي تزيد عن 50,000 دج";
  const messageFR = "Livraison gratuite pour les commandes de plus de 50 000 DZD";

  const message = language === 'ar' ? messageAR : messageFR;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
      <p>{message}</p>
    </div>
  );
}
