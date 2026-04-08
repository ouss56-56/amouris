'use client'
import { ShoppingBag, Users, TrendingUp, Package, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Order, Customer, Product } from '@/lib/types'

interface AdminDashboardClientProps {
  orders: Order[]
  customers: Customer[]
  products: Product[]
  adminEmail?: string
}

export default function AdminDashboardClient({ orders, customers, products, adminEmail }: AdminDashboardClientProps) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const activeProducts = products.filter(p => p.status === 'active').length

  const stats = [
    { label: 'Produits actifs', value: activeProducts, icon: Package, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Commandes totales', value: orders.length, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
    { label: 'Clients inscrits', value: customers.length, icon: Users, color: 'bg-purple-50 text-purple-700' },
    { label: 'Revenu total (DZD)', value: totalRevenue.toLocaleString(), icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
  ]

  const recentOrders = orders.slice(0, 8)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950 font-serif">Vue d'ensemble</h1>
          <p className="text-emerald-950/40 text-sm mt-1">Plateforme Amouris Parfums — Admin : {adminEmail}</p>
        </div>
        <div className="flex gap-4">
            <Link href="/admin/orders" className="text-xs font-bold bg-white px-4 py-2 border border-emerald-50 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors uppercase tracking-widest">Voir Commandes</Link>
            <Link href="/admin/products" className="text-xs font-bold bg-white px-4 py-2 border border-emerald-50 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors uppercase tracking-widest text-emerald-900">Voir Produits</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-[2rem] border border-emerald-50 p-8 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group">
            <div className={`inline-flex p-4 rounded-2xl ${color} mb-6 transition-transform group-hover:scale-110`}>
              <Icon size={24} />
            </div>
            <div className="text-3xl font-black text-emerald-950 font-sans tracking-tight">{value}</div>
            <div className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/20 mt-2">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-emerald-50 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-emerald-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-emerald-950 font-serif">Commandes récentes</h2>
                <Link href="/admin/orders" className="text-xs font-black text-amber-600 hover:text-amber-500 flex items-center gap-2 uppercase tracking-widest">
                    Tout voir <ArrowRight size={14} />
                </Link>
            </div>
            <div className="divide-y divide-emerald-50">
                {recentOrders.length > 0 ? (
                    recentOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-8 hover:bg-emerald-50/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-900 font-bold group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-emerald-950 font-mono text-sm tracking-tight">{order.orderNumber}</p>
                                    <p className="text-xs text-emerald-950/30 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                      {order.guestInfo ? `${order.guestInfo.firstName} ${order.guestInfo.lastName}` : 'Client Inconnu'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-900">{order.total.toLocaleString()} <span className="text-[10px] font-normal">DZD</span></p>
                                    <p className="text-[10px] text-emerald-950/20 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-emerald-950/20 font-serif text-lg">Aucune commande pour le moment</div>
                )}
            </div>
        </div>

        {/* Nouveaux Clients */}
        <div className="bg-white rounded-[2rem] border border-emerald-50 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-emerald-950 font-serif mb-8 text-center">Nouveaux Clients</h2>
            <div className="space-y-6">
                {customers.slice(0, 8).map(customer => (
                    <div key={customer.id} className="flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-all ${customer.status === 'frozen' ? 'bg-rose-50 text-rose-300' : 'bg-amber-50 text-amber-700'}`}>
                            {(customer.firstName || customer.phoneNumber).charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-emerald-950 truncate">{customer.firstName} {customer.lastName}</p>
                            <p className="text-[10px] text-emerald-950/30 uppercase tracking-widest font-black">{customer.wilaya}</p>
                        </div>
                        <Link href="/admin/customers" className="text-emerald-900/10 hover:text-emerald-900 transition-colors">
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ))}
                {customers.length === 0 && (
                   <p className="text-center text-emerald-950/20 py-8">Aucun client inscrit</p>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    preparing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-emerald-900 text-white',
    cancelled: 'bg-rose-100 text-rose-700',
  }
  const labels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmé', preparing: 'En préparation',
    shipped: 'Expédié', delivered: 'Livré', cancelled: 'Annulé',
  }
  return (
    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  )
}
