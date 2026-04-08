'use client'

import { useEffect, useMemo } from 'react'
import { useOrdersStore } from '@/store/orders.store'
import { useCustomersStore } from '@/store/customers.store'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, PieChart as PieChartIcon } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts'

export default function AdminAnalyticsPage() {
  const { orders, fetchOrders } = useOrdersStore()
  const { customers, fetchCustomers } = useCustomersStore()

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [fetchOrders, fetchCustomers])

  // Computed Stats
  const stats = useMemo(() => {
    if (!orders) return null;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Revenue by Day of Week (Last 7 Days approximation based on all orders for demo, or real grouping)
    // We'll group by Day of Week: Sun, Mon, Tue...
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const revenueByDayMap = new Map<number, number>();
    
    // Initialize map
    for (let i = 0; i < 7; i++) revenueByDayMap.set(i, 0);

    let perfumeSales = 0;
    let flaconSales = 0;

    orders.forEach(o => {
      const d = new Date(o.created_at);
      const dayIdx = d.getDay();
      revenueByDayMap.set(dayIdx, (revenueByDayMap.get(dayIdx) || 0) + o.total_amount);

      o.items.forEach(item => {
        // Simple heuristic: if it has quantity_grams it's perfume, else flacon
        if (item.quantity_grams) perfumeSales += item.total_price;
        else flaconSales += item.total_price;
      });
    });

    const revenueByDay = days.map((day, idx) => ({
      day,
      amount: revenueByDayMap.get(idx) || 0
    }));

    // Reorder to make today the last day
    const todayIdx = new Date().getDay();
    const orderedRevenueByDay = [
      ...revenueByDay.slice(todayIdx + 1),
      ...revenueByDay.slice(0, todayIdx + 1)
    ];

    const totalSales = perfumeSales + flaconSales;
    const salesByCategory = totalSales > 0 ? [
      { name: 'Parfums / Huiles', value: Math.round((perfumeSales / totalSales) * 100) },
      { name: 'Flacons / Carafes', value: Math.round((flaconSales / totalSales) * 100) },
    ] : [
      { name: 'Parfums / Huiles', value: 0 },
      { name: 'Flacons / Carafes', value: 0 },
    ];

    return {
      revenueByDay: orderedRevenueByDay,
      salesByCategory,
      totalRevenue,
      averageOrderValue,
      totalOrders,
      activeCustomers: customers.length
    };
  }, [orders, customers]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-900" size={48} />
      </div>
    )
  }

  const COLORS = ['#064e3b', '#C9A84C'] // Emerald and Gold

  return (
    <div className="space-y-12 p-4 md:p-0 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black font-serif text-emerald-950 flex items-center gap-4">
            <TrendingUp size={36} className="text-[#C9A84C]" />
            Analytiques & Rapports
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/40 mt-2">Intelligence Commerciale</p>
        </div>
      </header>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Panier Moyen', value: `${stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} DZD`, change: '+8%', positive: true },
          { label: 'Total Commandes', value: stats.totalOrders.toLocaleString(), change: '+12%', positive: true },
          { label: 'Clients Inscrits', value: stats.activeCustomers.toLocaleString(), change: '+5%', positive: true },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-emerald-950/5 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:bg-[#C9A84C]/20 transition-colors" />
            <div className="relative z-10">
              <div className="text-[10px] uppercase font-black tracking-widest text-emerald-950/30 mb-2">{kpi.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-black text-emerald-950 font-sans tracking-tight">{kpi.value}</div>
                <div className={`flex items-center text-[10px] font-black tracking-widest px-2 py-1 rounded-lg ${kpi.positive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {kpi.positive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                  {kpi.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-emerald-950/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-emerald-950 font-serif">Revenu Hebdomadaire</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/30 mt-1">Évolution des ventes sur les 7 derniers jours</p>
            </div>
            <div className="text-[10px] bg-emerald-50 text-emerald-900 px-4 py-2 rounded-xl font-black uppercase tracking-widest">DZD</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByDay}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#0a3d2e', opacity: 0.5 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#0a3d2e', opacity: 0.5 }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: '1px solid rgba(6, 78, 59, 0.05)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 20px' }} 
                  itemStyle={{ fontWeight: 900, color: '#064e3b', fontSize: '14px' }}
                  labelStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '4px', fontWeight: 800 }}
                  formatter={(value: number) => [`${value.toLocaleString()} DZD`, 'Revenu']}
                />
                <Area type="monotone" dataKey="amount" stroke="#064e3b" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#C9A84C', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-950/5 shadow-sm flex flex-col">
          <div>
             <h2 className="text-2xl font-bold text-emerald-950 font-serif">Part des Ventes</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950/30 mt-1">Répartition par catégorie</p>
          </div>
          <div className="flex-1 flex flex-col justify-center relative mt-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={stats.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {stats.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 800, color: '#064e3b' }}
                    formatter={(value: number) => [`${value}%`, 'Part']}
                  />
                </RePieChart>
              </ResponsiveContainer>
              {/* Center Text in Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <PieChartIcon size={24} className="text-emerald-950/20 mb-1" />
                <span className="text-xl font-serif font-black text-emerald-950">{stats.totalOrders}</span>
                <span className="text-[8px] font-black tracking-widest uppercase text-emerald-950/30">Ventes</span>
              </div>
            </div>
            
            <div className="space-y-4 mt-8 px-4">
               {stats.salesByCategory.map((cat, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-emerald-950/5">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-xs font-bold text-emerald-950">{cat.name}</span>
                   </div>
                   <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-emerald-950/5 text-emerald-950">{cat.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
