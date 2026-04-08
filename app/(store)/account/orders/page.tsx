'use client';

import AccountOrdersClient from './AccountOrdersClient';
import { useCustomerAuth } from '@/store/customer-auth.store';

export default function AccountOrdersPage() {
  const { customer, isAuthenticated } = useCustomerAuth();
  
  if (!customer || !isAuthenticated) return null;

  return <AccountOrdersClient customerId={customer.id} />;
}
