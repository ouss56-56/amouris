'use client';

import SettingsClient from './SettingsClient';
import { useCustomerAuth } from '@/store/customer-auth.store';

export default function SettingsPage() {
  const { customer, isAuthenticated } = useCustomerAuth();
  
  if (!customer || !isAuthenticated) return null;

  return <SettingsClient />;
}
