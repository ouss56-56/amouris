'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('payment_status', 'paid');

  if (error) {
    console.error('Error fetching revenue stats:', error);
    return [];
  }

  const stats = (data || []).reduce((acc: any, order: any) => {
    const date = new Date(order.created_at);
    let key = '';
    
    if (period === 'daily') {
      key = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else if (period === 'weekly') {
      const first = date.getDate() - date.getDay();
      const firstDay = new Date(date.setDate(first));
      key = firstDay.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } else {
      key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }
    
    acc[key] = (acc[key] || 0) + Number(order.total_amount);
    return acc;
  }, {});

  return Object.entries(stats).map(([label, value]) => ({ 
    day: label, 
    amount: value as number 
  }));
}

export async function getAnalyticsData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Revenue by day (for the chart)
  const revenueByDay = await getRevenueByPeriod('daily');

  // 2. Sales by Category (Real aggregate)
  const { data: catData } = await supabase
    .from('order_items')
    .select('product_id, products(product_type), total_price');
  
  const catTotals = (catData || []).reduce((acc: any, item: any) => {
    const type = item.products?.product_type === 'perfume' ? 'Parfums' : 'Flacons';
    acc[type] = (acc[type] || 0) + Number(item.total_price);
    return acc;
  }, {});

  const totalSales = Object.values(catTotals).reduce((a: any, b: any) => a + b, 0) as number;
  const salesByCategory = Object.entries(catTotals).map(([name, value]) => ({
    name,
    value: totalSales > 0 ? Math.round(((value as number) / totalSales) * 100) : 0
  }));

  // 3. KPI Calculations
  const { data: orders } = await supabase.from('orders').select('total_amount');
  const totalOrders = orders?.length || 0;
  const totalRev = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  const avgCart = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;

  const { data: activeCustomers } = await supabase.from('orders').select('customer_id', { count: 'exact', head: false }); // Unique customers? Supabase select('customer_id', { count: 'exact' }) doesn't do unique
  // Better approach for unique customers in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('customer_id, guest_phone')
    .gt('created_at', thirtyDaysAgo.toISOString());
  
  const uniqueClients = new Set();
  recentOrders?.forEach(o => uniqueClients.add(o.customer_id || o.guest_phone));

  return {
    revenueByDay: revenueByDay.slice(-7), // Last 7 points
    salesByCategory: salesByCategory.length > 0 ? salesByCategory : [
      { name: 'Parfums', value: 0 },
      { name: 'Flacons', value: 0 },
    ],
    kpis: {
      avgCart: `${avgCart.toLocaleString()} DZD`,
      activeClients: uniqueClients.size.toLocaleString(),
      conversionRate: '2.4%' // Mocked for now as we don't track visits yet
    }
  };
}

export async function getOverviewData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Total Revenue
  const { data: orders } = await supabase.from('orders').select('total_amount, order_status');
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  
  // 2. Counts
  const totalOrders = orders?.length || 0;
  
  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 3. Recent 5 Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Recent 5 Customers
  const { data: recentCustomers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalRevenue,
    totalOrders,
    activeProducts: activeProducts || 0,
    totalCustomers: totalCustomers || 0,
    recentOrders: recentOrders || [],
    recentCustomers: recentCustomers || []
  };
}
