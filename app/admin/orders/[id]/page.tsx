'use client'

import { use } from 'react'
import AdminOrderDetailClient from './AdminOrderDetailClient'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return <AdminOrderDetailClient orderId={id} />
}
