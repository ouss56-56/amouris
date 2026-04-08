'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/store/admin-auth.store'
import { AdminSidebar } from '@/components/admin/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoginPage && !isAdminAuthenticated) {
      router.replace('/admin/login')
    }
  }, [isAdminAuthenticated, isLoginPage, router])

  // Page login → pas de layout
  if (isLoginPage) return <>{children}</>

  // Pas authentifié → rien (la redirection est en cours)
  if (!isAdminAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-gray-50" dir="ltr">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
