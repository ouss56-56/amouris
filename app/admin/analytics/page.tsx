import { createClient } from '@/lib/supabase/server'
import AnalyticsClient from './AnalyticsClient'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Fetch all necessary data for analytics in parallel
  const [
    { data: orders },
    { data: customers },
    { data: products }
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('*, variants:flacon_variants(*)')
      .order('created_at', { ascending: false })
  ])

  return (
    <AnalyticsClient 
      initialOrders={orders || []} 
      initialCustomers={customers || []} 
      initialProducts={products || []} 
    />
  )
}
