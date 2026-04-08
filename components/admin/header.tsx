"use client";

import { useI18n } from '@/i18n/i18n-context';
import { useAdminStore } from '@/store/admin-ui.store';
import { Button } from '@/components/ui/button';
import { Menu, Bell, User } from 'lucide-react';
import { LanguageToggle } from '@/components/store/language-toggle';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AdminHeader() {
  const { toggleSidebar } = useAdminStore();
  const { language } = useI18n();
  const [pendingCount, setPendingCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial fetch
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'pending');
      
      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    // 2. Realtime subscription
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          // Re-fetch count on any change to be safe and accurate
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden" onClick={toggleSidebar}>
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
           <div className="text-sm font-medium text-muted-foreground">
             Amouris Admin Portal
           </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <LanguageToggle />
          
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-2 w-5 h-5 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-background">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Button>

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
