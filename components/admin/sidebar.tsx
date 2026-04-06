"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useAdminStore } from '@/store/admin-store';
import { 
  LayoutDashboard, Package, Tag, Users, ShoppingCart, 
  FileText, TrendingUp, Settings, Inbox, Menu, Store 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminSidebar() {
  const pathname = usePathname();
  const { language, dir } = useI18n();
  const { sidebarOpen, setSidebarOpen } = useAdminStore();

  const navGroups = [
    {
      title: language === 'ar' ? 'الكتالوج' : 'Catalogue',
      items: [
        { name: language === 'ar' ? 'المنتجات' : 'Produits', href: '/admin/products', icon: Package },
        { name: language === 'ar' ? 'الأصناف' : 'Catégories', href: '/admin/categories', icon: Tag },
        { name: language === 'ar' ? 'العلامات' : 'Marques', href: '/admin/brands', icon: Store },
      ]
    },
    {
      title: language === 'ar' ? 'المبيعات' : 'Ventes',
      items: [
        { name: language === 'ar' ? 'الطلبات' : 'Commandes', href: '/admin/orders', icon: ShoppingCart },
        { name: language === 'ar' ? 'الفواتير' : 'Factures', href: '/admin/invoices', icon: FileText },
        { name: language === 'ar' ? 'العملاء' : 'Clients', href: '/admin/customers', icon: Users },
      ]
    },
    {
      title: language === 'ar' ? 'المخزون' : 'Inventaire',
      items: [
        { name: language === 'ar' ? 'إدارة المخزون' : 'Gestion des stocks', href: '/admin/inventory', icon: Inbox },
      ]
    },
    {
      title: language === 'ar' ? 'التقارير' : 'Système',
      items: [
        { name: language === 'ar' ? 'التحليلات' : 'Analytiques', href: '/admin/analytics', icon: TrendingUp },
        { name: language === 'ar' ? 'الإعدادات' : 'Paramètres', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-50 w-72 bg-card border-${dir === 'rtl' ? 'l' : 'r'} transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen 
          ? 'translate-x-0' 
          : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'
        }
      `}>
        <div className="flex h-16 items-center border-b px-6 justify-between">
          <Link href="/admin" className="font-heading text-2xl font-bold text-primary">
            Amouris<span className="text-accent ml-1">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
             <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-64px)] p-4 no-scrollbar">
          <Link href="/admin" className="block mb-6">
            <Button 
                variant={pathname === '/admin' ? 'secondary' : 'ghost'} 
                className={`w-full justify-start ${pathname === '/admin' ? 'font-bold text-primary' : ''}`}
              >
                <LayoutDashboard className="mr-3 w-5 h-5 rtl:mr-0 rtl:ml-3" />
                {language === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </Button>
          </Link>
          
          <div className="space-y-8">
            {navGroups.map((group, i) => (
              <div key={i}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button 
                          variant={isActive ? 'secondary' : 'ghost'} 
                          className={`w-full justify-start ${isActive ? 'font-bold text-primary' : 'text-foreground/80'}`}
                        >
                          <item.icon className="mr-3 w-5 h-5 rtl:mr-0 rtl:ml-3" />
                          {item.name}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t pt-4">
             <Link href="/">
                <Button variant="outline" className="w-full truncate text-ellipsis">
                  {language === 'ar' ? 'العودة للمتجر' : 'Retour à la boutique'}
                </Button>
             </Link>
          </div>
        </div>
      </div>
    </>
  );
}
