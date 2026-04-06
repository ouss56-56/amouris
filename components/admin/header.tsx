"use client";

import { useI18n } from '@/i18n/i18n-context';
import { useAdminStore } from '@/store/admin-store';
import { Button } from '@/components/ui/button';
import { Menu, Bell, User } from 'lucide-react';
import { LanguageToggle } from '@/components/store/language-toggle';

export function AdminHeader() {
  const { toggleSidebar } = useAdminStore();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden" onClick={toggleSidebar}>
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Separator for small screens */}
      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
           <div className="flex items-center text-sm font-medium text-muted-foreground">
             Amouris Admin Portal
           </div>
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <LanguageToggle />
          
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-destructive rounded-full" />
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          {/* Profile dropdown */}
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
