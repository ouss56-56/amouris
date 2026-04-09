"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useCustomerAuth } from '@/store/customer-auth.store';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Heart,
  Menu,
  X
} from 'lucide-react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useI18n();
  const { customer, logout, isAuthenticated } = useCustomerAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && !customer) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, customer, router]);

  if (!mounted || !customer) return null;

  // Defensive: handle both snake_case (DB) and camelCase (legacy) field names
  const firstName = customer.first_name || (customer as any).firstName || '';
  const lastName = customer.last_name || (customer as any).lastName || '';

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const navItems = [
    { href: '/account', label: t('account.nav.dashboard'), icon: LayoutDashboard },
    { href: '/account/orders', label: t('account.nav.orders'), icon: ShoppingBag },
    { href: '/account/favorites', label: t('account.nav.favorites'), icon: Heart },
    { href: '/account/settings', label: t('account.nav.settings'), icon: Settings },
  ];

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col md:flex-row">
      
      {/* Mobile Header / Drawer Toggle */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-emerald-950/5 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0a3d2e] text-white rounded-full flex items-center justify-center text-lg font-serif">
            {firstName.charAt(0) || '?'}
          </div>
          <span className="font-bold text-emerald-950">{customer.shop_name || `${firstName} ${lastName}`}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-emerald-950">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-emerald-950/5 flex flex-col transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        rtl:left-auto rtl:right-0 rtl:${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 border-b border-emerald-950/5 bg-neutral-50/30">
          <div className="w-20 h-20 bg-[#0a3d2e] text-white rounded-[2rem] flex items-center justify-center text-3xl font-serif mb-4 shadow-xl shadow-emerald-900/10">
            {firstName.charAt(0) || '?'}
          </div>
          <h2 className="font-serif text-xl text-emerald-950 font-bold leading-tight">
            {firstName} {lastName}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C] mt-1 opacity-80">
            {customer.shop_name || t('common.partner')}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/account');
            
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <button className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-[#0a3d2e] text-white shadow-lg shadow-emerald-900/10' 
                    : 'text-emerald-950/40 hover:text-emerald-950 hover:bg-emerald-50'}
                `}>
                  <Icon size={18} strokeWidth={2.5} />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-950/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all font-bold"
          >
            <LogOut size={18} strokeWidth={2.5} />
            {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-max-7xl mx-auto p-4 md:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
