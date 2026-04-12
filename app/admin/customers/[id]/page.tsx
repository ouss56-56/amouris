import { fetchCustomerById } from '@/lib/api/customers';
import AdminCustomerDetailClient from './AdminCustomerDetailClient';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const customer = await fetchCustomerById(id, supabase);

    if (!customer) {
      notFound();
    }

    return <AdminCustomerDetailClient initialCustomer={customer} />;
  } catch (error) {
    console.error('Error fetching customer:', error);
    notFound();
  }
}
