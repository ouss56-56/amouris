"use client";

import { useI18n } from '@/i18n/i18n-context';
import { useAdminStore } from '@/store/admin-ui.store';
import { Button } from '@/components/ui/button';
import { Menu, Bell, User, ShoppingBag, Clock } from 'lucide-react';
import { LanguageToggle } from '@/components/store/language-toggle';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';

export function AdminHeader() {
  const { toggleSidebar } = useAdminStore();
  const { t, language } = useI18n();
  const [pendingCount, setPendingCount] = useState(0);
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const supabase = createClient();

  const fetchNotifications = async () => {
    // 1. Fetch count
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending');
    
    if (!countError && count !== null) {
      setPendingCount(count);
    }

    // 2. Fetch latest 5 pending orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, created_at, guest_first_name, guest_last_name, total_amount')
      .eq('order_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!ordersError && orders) {
      setLatestOrders(orders);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('admin-notifications-header')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 min-w-[44px] min-h-[44px] text-gray-500 lg:hidden" onClick={toggleSidebar}>
        <span className="sr-only">{t('admin.common.open_sidebar')}</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
           <div className="text-sm font-medium text-emerald-950/60 font-serif italic">
             {t('admin.common.portal_title')}
           </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <LanguageToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 min-w-[44px] min-h-[44px] text-gray-500 relative hover:bg-emerald-50 transition-colors rounded-xl">
                <span className="sr-only">{t('admin.common.view_notifications')}</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-2 w-5 h-5 bg-emerald-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-background animate-pulse">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-emerald-950/5 shadow-2xl overflow-hidden">
               <div className="bg-[#0a3d2e] p-4 text-white">
                  <DropdownMenuLabel className="font-serif text-lg py-0">Notifications</DropdownMenuLabel>
                  <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mt-1">
                    {pendingCount} {pendingCount <= 1 ? 'Nouvelle commande' : 'Nouvelles commandes'}
                  </p>
               </div>
               
               <ScrollArea className="h-[350px]">
                  {latestOrders.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {latestOrders.map((order) => (
                        <DropdownMenuItem key={order.id} asChild className="p-0 focus:bg-emerald-50 rounded-xl">
                          <Link href={`/admin/orders/${order.id}`} className="flex items-start gap-4 p-4 transition-colors">
                             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                                <ShoppingBag size={18} />
                             </div>
                             <div className="space-y-1 overflow-hidden">
                                <p className="text-sm font-bold text-emerald-950 truncate">
                                   {order.guest_first_name} {order.guest_last_name}
                                </p>
                                <p className="text-[10px] font-medium text-emerald-950/50 flex items-center gap-1">
                                   <Clock size={10} /> {new Date(order.created_at).toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                   <span className="mx-1">•</span>
                                   {order.order_number}
                                </p>
                                <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest pt-1">
                                   {order.total_amount.toLocaleString()} DZD
                                </p>
                             </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-emerald-100">
                          <Bell size={24} />
                       </div>
                       <p className="text-sm font-serif text-emerald-950/20 italic">Aucune notification.</p>
                    </div>
                  )}
               </ScrollArea>
               
               <DropdownMenuSeparator className="m-0 bg-emerald-950/5" />
               <div className="p-2">
                 <Link href="/admin/orders" className="flex items-center justify-center w-full py-3 text-[10px] font-black uppercase tracking-widest text-emerald-950/40 hover:text-emerald-950 transition-colors">
                    Voir toutes les commandes
                 </Link>
               </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <div className="flex items-center p-1.5 gap-2">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
