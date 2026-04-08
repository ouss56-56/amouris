"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useCustomerAuth } from '@/store/customer-auth.store';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useI18n();
  const { customer: user, logout } = useCustomerAuth();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/account', label: language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord', icon: LayoutDashboard },
    { href: '/account/orders', label: language === 'ar' ? 'طلباتي' : 'Mes commandes', icon: ShoppingBag },
    { href: '/account/wishlist', label: language === 'ar' ? 'المفضلة' : 'Favoris', icon: Heart },
    { href: '/account/settings', label: language === 'ar' ? 'إعدادات الحساب' : 'Paramètres', icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b bg-secondary/30 text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {user.firstName[0]}
              </div>
              <h2 className="font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-muted-foreground">{user.shopName}</p>
            </div>
            
            <nav className="flex flex-col p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/account');
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={isActive ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start ${isActive ? 'font-bold text-primary' : ''}`}
                    >
                      <Icon className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              <div className="border-t mt-2 pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                  {t('common.logout')}
                </Button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
