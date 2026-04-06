import { getRevenueByPeriod, getOrdersByWilaya, getTopProducts } from '@/lib/actions/analytics';
import { getCurrentUser } from '@/lib/actions/auth';
import AdminAnalyticsClient from './AdminAnalyticsClient';
import { redirect } from 'next/navigation';

export default async function AdminAnalyticsPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [revenueStats, wilayaStats, topProducts] = await Promise.all([
    getRevenueByPeriod('monthly'),
    getOrdersByWilaya(),
    getTopProducts(10)
  ]);

  return (
    <AdminAnalyticsClient 
      revenueStats={revenueStats}
      wilayaStats={wilayaStats}
      topProducts={topProducts}
    />
  );
}

