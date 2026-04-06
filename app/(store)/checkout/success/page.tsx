import { getOrderById } from '@/lib/actions/orders';
import CheckoutSuccessClient from './CheckoutSuccessClient';
import { notFound } from 'next/navigation';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const orderId = searchParams.id;

  let orderNumber = '-----';
  if (orderId) {
    const order = await getOrderById(orderId);
    if (order) {
      orderNumber = order.orderNumber;
    }
  }

  return <CheckoutSuccessClient orderNumber={orderNumber} />;
}
