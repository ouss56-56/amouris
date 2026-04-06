'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Order, OrderStatus, PaymentStatus, OrderItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createOrder(orderData: {
  customerId: string | 'guest';
  guestInfo?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    wilaya: string;
  };
  items: (OrderItem & { type: 'perfume' | 'flacon' })[];
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

  // 3. Deduct Stock & Validate
  for (const item of orderData.items) {
    if (item.type === 'perfume') {
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('stock_grams')
        .eq('id', item.productId)
        .single();
      
      if (prodErr || !prod) throw new Error(`Product not found: ${item.productId}`);
      if (prod.stock_grams < item.quantity) {
        throw new Error(`Stock insuffisant pour ${item.productNameFR}`);
      }

      const { error: updErr } = await supabase
        .from('products')
        .update({ stock_grams: prod.stock_grams - item.quantity })
        .eq('id', item.productId);
      
      if (updErr) throw new Error(`Failed to update stock for ${item.productNameFR}`);
    } else if (item.type === 'flacon' && item.variantId) {
      const { data: variant, error: varErr } = await supabase
        .from('flacon_variants')
        .select('stock_units')
        .eq('id', item.variantId)
        .single();
      
      if (varErr || !variant) throw new Error(`Variant not found: ${item.variantId}`);
      if (variant.stock_units < item.quantity) {
        throw new Error(`Stock insuffisant pour le flacon ${item.productNameFR}`);
      }

      const { error: updErr } = await supabase
        .from('flacon_variants')
        .update({ stock_units: variant.stock_units - item.quantity })
        .eq('id', item.variantId);
      
      if (updErr) throw new Error(`Failed to update stock for variant ${item.variantId}`);
    }
  }

  // 4. Insert order items
  const itemsToInsert = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    flacon_variant_id: item.variantId || null,
    product_name_fr: item.productNameFR,
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
    console.error('Failed to insert items:', itemsError);
    // In a real prod environment, you'd want to rollback stock here or use a DB transaction
  }

  revalidatePath('/admin/orders');
  revalidatePath('/account/orders');
  revalidatePath('/admin/products');
  revalidatePath('/shop');
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

export async function getAllOrders(filters?: {
  status?: OrderStatus;
  search?: string;
  wilaya?: string;
  startDate?: string;
  endDate?: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('orders')
    .select('*, order_items(*), profiles(first_name, last_name, phone)');

  if (filters?.status) {
    query = query.eq('order_status', filters.status);
  }

  if (filters?.wilaya) {
    // Check both guest_wilaya and profile wilaya
    query = query.or(`guest_wilaya.eq.${filters.wilaya},profiles.wilaya.eq.${filters.wilaya}`);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.search) {
    const s = `%${filters.search}%`;
    query = query.or(`order_number.ilike.${s},guest_first_name.ilike.${s},guest_last_name.ilike.${s},profiles.first_name.ilike.${s},profiles.last_name.ilike.${s}`);
  }

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

function mapDbOrderToFrontend(dbOrder: {
  id: string;
  order_number: string;
  customer_id: string | null;
  guest_phone?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_wilaya?: string;
  order_items?: any[];
  total_amount: number | string;
  order_status: string;
  payment_status: string;
  amount_paid: number | string;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerId: dbOrder.customer_id || 'guest',
    guestInfo: dbOrder.guest_phone ? {
      firstName: dbOrder.guest_first_name || '',
      lastName: dbOrder.guest_last_name || '',
      phoneNumber: dbOrder.guest_phone,
      wilaya: dbOrder.guest_wilaya || '',
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
