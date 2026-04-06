import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <AdminSidebar />
      <div className="lg:pl-72 focus:outline-none transition-all duration-300 rtl:lg:pl-0 rtl:lg:pr-72">
        <AdminHeader />
        <main className="flex-1">
          <div className="py-8">
            <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-[1400px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
