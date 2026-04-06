'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createOrder(orderData: {
  customerId: string | 'guest';
  guestInfo?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    wilaya: string;
  };
  items: any[];
  total: number;
  notes?: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Get next order number from DB sequence
  const { data: orderNum, error: seqError } = await supabase.rpc('next_order_number');
  if (seqError) throw new Error('Failed to generate order number: ' + seqError.message);

  const order_number = `AM-${String(orderNum).padStart(6, '0')}`;

  // 2. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      order_number,
      customer_id: orderData.customerId === 'guest' ? null : orderData.customerId,
      guest_first_name: orderData.guestInfo?.firstName,
      guest_last_name: orderData.guestInfo?.lastName,
      guest_phone: orderData.guestInfo?.phoneNumber,
      guest_wilaya: orderData.guestInfo?.wilaya,
      total_amount: orderData.total,
      admin_notes: orderData.notes,
      order_status: 'pending',
      payment_status: 'unpaid',
      amount_paid: 0,
    }])
    .select()
    .single();

  if (orderError) throw new Error('Order creation failed: ' + orderError.message);

  // 3. Insert order items
  const itemsToInsert = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    flacon_variant_id: item.variantId || null,
    product_name_fr: item.productNameFR, // Pass names too for snapshots
    product_name_ar: item.productNameAR,
    quantity_grams: item.type === 'perfume' ? item.quantity : null,
    quantity_units: item.type === 'flacon' ? item.quantity : null,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    // Ideally you'd do this in a transaction, but Supabase SDK doesn't support them easily out-of-box.
    // Consider using a DB function/RPC if robustness is critical.
    console.error('Failed to insert items:', itemsError);
    // At least notify admin or handle failure
  }

  revalidatePath('/admin/orders');
  revalidatePath('/account/orders');
  return order;
}

export async function getOrdersByCustomer(customerId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }

  return (data || []).map(mapDbOrderToFrontend);
}

export async function getOrderById(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching order by ID:', error);
    return null;
  }

  return mapDbOrderToFrontend(data);
}

export async function getAllOrders(filters?: any) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('orders')
    .select('*, order_items(*), profile:profiles(first_name, last_name, phone)');

  // Apply filters...
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }

  return (data || []).map(mapDbOrderToFrontend);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
}

export async function updatePayment(id: string, amountPaid: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch current order to check total
  const { data: order } = await supabase.from('orders').select('total_amount').eq('id', id).single();
  if (!order) return;

  const total = Number(order.total_amount);
  const paymentStatus: PaymentStatus = amountPaid >= total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';

  const { error } = await supabase
    .from('orders')
    .update({ 
      amount_paid: amountPaid, 
      payment_status: paymentStatus,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/orders');
}

function mapDbOrderToFrontend(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerId: dbOrder.customer_id || 'guest',
    guestInfo: dbOrder.guest_phone ? {
      firstName: dbOrder.guest_first_name,
      lastName: dbOrder.guest_last_name,
      phoneNumber: dbOrder.guest_phone,
      wilaya: dbOrder.guest_wilaya,
    } : undefined,
    items: (dbOrder.order_items || []).map((item: any) => ({
      productId: item.product_id,
      variantId: item.flacon_variant_id,
      quantity: item.quantity_grams || item.quantity_units,
      unitPrice: Number(item.unit_price),
      productNameFR: item.product_name_fr,
      productNameAR: item.product_name_ar,
    })),
    total: Number(dbOrder.total_amount),
    status: dbOrder.order_status as OrderStatus,
    paymentStatus: dbOrder.payment_status as PaymentStatus,
    amountPaid: Number(dbOrder.amount_paid),
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    notes: dbOrder.admin_notes,
  };
}
