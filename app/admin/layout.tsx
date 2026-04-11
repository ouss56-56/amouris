'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/store/admin-auth.store'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { useI18n } from '@/i18n/i18n-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAdminAuth();
  const router = useRouter()
  const pathname = usePathname()
  const { dir } = useI18n()

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (_hasHydrated && !isLoginPage && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [_hasHydrated, isAuthenticated, isLoginPage, router]);

  // Page login → pas de layout
  if (isLoginPage) return <>{children}</>

  // Pas authentifié → rien (la redirection est en cours)
  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-gray-50" dir="ltr">
      <AdminSidebar />
      <main className={`flex-1 min-w-0 overflow-auto ${dir === 'rtl' ? 'lg:pr-72' : 'lg:pl-72'}`}>
        <AdminHeader />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

