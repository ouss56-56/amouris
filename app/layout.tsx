import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/i18n/i18n-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Amouris Parfums | أموريس للعطور',
  description: 'Plateforme B2B de parfums de luxe et flacons. منصة بيع العطور الزيتية والقوارير بالجملة.',
};

import { DynamicHtmlAttributes } from '@/components/store/DynamicHtmlAttributes';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background selection:bg-amber-100 selection:text-emerald-950`}>
        <I18nProvider>
          <DynamicHtmlAttributes />
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              className: 'rounded-none border-emerald-100 font-sans shadow-xl text-sm',
              style: {
                borderRadius: '0px',
              }
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
