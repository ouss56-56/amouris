import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { AnnouncementBar } from '@/components/store/announcement-bar';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
