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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Next.js hydration requires html/body tags.
    // The lang and dir will be injected by the I18nProvider dynamically.
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background`}>
        <I18nProvider>
          {children}
          <Toaster position="top-center" richColors theme="light" />
        </I18nProvider>
      </body>
    </html>
  );
}
