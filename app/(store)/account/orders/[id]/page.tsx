'use client';

import { useOrdersStore } from '@/store/orders.store';
import OrderDetailClient from './OrderDetailClient';
import { useCustomerAuth } from '@/store/customer-auth.store';
import { useEffect, useState, use } from 'react';
import { Order } from '@/store/orders.store';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { customer, isAuthenticated } = useCustomerAuth();
  const getByCustomer = useOrdersStore(s => s.getByCustomer);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (customer) {
      const orders = getByCustomer(customer.id);
      const found = orders.find(o => o.id === id);
      if (found) {
        setOrder(found);
      }
    }
  }, [customer, getByCustomer, id]);

  if (!isAuthenticated || !customer) {
    return null;
  }

  if (order === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-emerald-950/20">
        <div className="w-12 h-12 border-4 border-emerald-950/5 border-t-emerald-900 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest">Chargement de la commande...</p>
      </div>
    );
  }

  return <OrderDetailClient order={order} />;
}
