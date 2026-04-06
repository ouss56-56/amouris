'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // This is a simplified version using the created_at field
  // In a real app, you'd use a more complex SQL query for aggregation
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('payment_status', 'paid');

  if (error) {
    console.error('Error fetching revenue stats:', error);
    return [];
  }

  // Basic aggregation logic (client-side in the server action for now)
  const stats = (data || []).reduce((acc: any, order: any) => {
    const date = new Date(order.created_at);
    let key = '';
    
    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      // Get first day of week
      const first = date.getDate() - date.getDay();
      const firstDay = new Date(date.setDate(first));
      key = firstDay.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    acc[key] = (acc[key] || 0) + Number(order.total_amount);
    return acc;
  }, {});

  return Object.entries(stats).map(([label, value]) => ({ 
    label, 
    value: value as number 
  }));
}

export async function getTopProducts(limit = 5): Promise<{ name: string; revenue: number }[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, total_price, product_name_fr')
    .order('total_price', { ascending: false });

  if (error) {
    console.error('Error fetching top products:', error);
    return [];
  }

  // Aggregate by product_id
  const stats = (data || []).reduce((acc: any, item: any) => {
    acc[item.product_id] = {
      name: item.product_name_fr,
      revenue: (acc[item.product_id]?.revenue || 0) + Number(item.total_price),
    };
    return acc;
  }, {});

  return Object.values(stats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, limit) as { name: string; revenue: number }[];
}

export async function getOrdersByWilaya(): Promise<{ label: string; value: number }[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('orders')
    .select('guest_wilaya, customer_id, profiles(wilaya)');

  if (error) {
    console.error('Error fetching wilaya stats:', error);
    return [];
  }

  const stats = (data || []).reduce((acc: any, order: any) => {
    const wilaya = order.guest_wilaya || (order.profiles as any)?.wilaya || 'Unknown';
    acc[wilaya] = (acc[wilaya] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(stats).map(([label, value]) => ({ 
    label, 
    value: value as number 
  }));
}
