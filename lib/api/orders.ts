import { createClient } from '@/lib/supabase/client';

import { createAdminClient } from '@/lib/supabase/admin';

export const fetchAllOrders = async () => {
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      customer:profiles(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchCustomerOrders = async (customerId: string, client?: any) => {
  const supabase = client || createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchOrderById = async (id: string, client?: any) => {
  const supabase = client || createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      status_history:order_status_history(*),
      customer:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createOrder = async (data: any) => {
  // Always use browser client if called from client
  const supabase = createClient();
  const { items, ...orderData } = data;

  // Generate a unique order number client-side as a failsafe
  // (the DB trigger may also generate one, but this ensures the NOT NULL constraint is satisfied)
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(Math.random() * 900000 + 100000);
  const fallbackOrderNumber = `AM-${randomPart}`;

  // Ensure all fields are null if undefined (Supabase accepts null but may reject undefined)
  const cleanedOrderData = {
    order_number: fallbackOrderNumber,
    customer_id: orderData.customer_id ?? null,
    is_registered_customer: !!orderData.is_registered_customer,
    guest_first_name: orderData.guest_first_name ?? null,
    guest_last_name: orderData.guest_last_name ?? null,
    guest_phone: orderData.guest_phone ?? null,
    guest_wilaya: orderData.guest_wilaya ?? null,
    guest_commune: orderData.guest_commune ?? null,
    total_amount: orderData.total_amount,
    payment_status: orderData.payment_status || 'unpaid',
    order_status: orderData.order_status || 'pending',
    admin_notes: orderData.admin_notes ?? null,
  };

  // 1. Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([cleanedOrderData])
    .select()
    .single();

  if (orderError) {
    console.error('CRITICAL: Supabase order creation error:', {
      error: orderError,
      data_sent: cleanedOrderData
    });
    throw new Error(`Échec de la création de la commande: ${orderError.message || 'Erreur inconnue'}`);
  }

  // 2. Create Order Items
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_type: item.product_type,
    flacon_variant_id: item.flacon_variant_id ?? null,
    product_name_fr: item.product_name_fr,
    product_name_ar: item.product_name_ar,
    variant_label: item.variant_label ?? null,
    quantity_grams: item.quantity_grams ?? null,
    quantity_units: item.quantity_units ?? null,
    unit_price: item.unit_price,
    total_price: item.total_price
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('Supabase order items error:', itemsError);
    throw new Error(`Échec de l'ajout des articles: ${itemsError.message}`);
  }

  // 3. Initial history
  const { error: historyError } = await supabase.from('order_status_history').insert({
    order_id: order.id,
    status: cleanedOrderData.order_status,
    note: 'Commande créée'
  });

  if (historyError) {
    console.warn('Supabase order history error:', historyError);
    // Historique non-critique pour le succès de la commande, mais on log
  }

  return { ...order, items: orderItems };
};

export const updateOrderStatus = async (id: string, status: string, note?: string) => {
  
  const supabase = createClient();
  
  // Update order
  const { error: updateError } = await supabase
    .from('orders')
    .update({ order_status: status })
    .eq('id', id);

  if (updateError) throw updateError;

  // Add history
  await supabase.from('order_status_history').insert({
    order_id: id,
    status,
    note
  });

  return true;
};

export const updateOrderPayment = async (id: string, amountPaid: number) => {
  
  const supabase = createClient();

  const { data: order } = await supabase.from('orders').select('total_amount').eq('id', id).single();
  
  if (!order) throw new Error('Order not found');

  const ps = amountPaid <= 0 ? 'unpaid' : amountPaid >= order.total_amount ? 'paid' : 'partial';

  const { error } = await supabase
    .from('orders')
    .update({ amount_paid: amountPaid, payment_status: ps })
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateOrderNotes = async (id: string, notes: string) => {
  
  const supabase = createClient();

  const { error } = await supabase
    .from('orders')
    .update({ admin_notes: notes })
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const generateInvoice = async (orderId: string, invoiceData: any) => {
  
  const supabase = createClient();
  
  // Create deterministic fake ID
  const invoiceNumber = `FAC-${Math.floor(Math.random() * 900000) + 100000}`;
  const finalData = { ...invoiceData, invoice_number: invoiceNumber };

  const { error } = await supabase
    .from('orders')
    .update({ 
      invoice_generated: true, 
      invoice_data: finalData 
    })
    .eq('id', orderId);

  if (error) throw error;
  return invoiceNumber;
};
