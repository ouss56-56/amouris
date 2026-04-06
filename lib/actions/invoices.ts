'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { revalidatePath } from 'next/cache';

export async function generateInvoice(orderId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Order not found: ' + orderError?.message);
  }

  // 2. Get next invoice number
  const { data: invNum, error: invError } = await supabase.rpc('next_invoice_number');
  if (invError) throw new Error('Failed to generate invoice number');

  const invoice_number = `FAC-${String(invNum).padStart(6, '0')}`;

  // 3. Generate PDF (Simplified)
  const doc = new jsPDF() as any;
  doc.setFontSize(22);
  doc.text('AMOURIS PARFUMS', 20, 20);
  doc.setFontSize(14);
  doc.text(`INVOICE: ${invoice_number}`, 20, 35);
  doc.text(`Order Number: ${order.order_number}`, 20, 45);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);

  const items = (order.order_items || []).map((item: any) => [
    item.product_name_fr,
    item.quantity_grams || item.quantity_units,
    `${item.unit_price} DZD`,
    `${item.total_price} DZD`,
  ]);

  doc.autoTable({
    startY: 65,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: items,
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total Amount: ${order.total_amount} DZD`, 20, finalY);

  const pdfOutput = doc.output('arraybuffer');

  // 4. Upload to Storage
  const fileName = `${invoice_number}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(fileName, pdfOutput, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) throw new Error('PDF Upload failed: ' + uploadError.message);

  const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName);

  // 5. Create Invoice Record
  const { data: invoice, error: recordError } = await supabase
    .from('invoices')
    .insert([{
      invoice_number,
      order_id: orderId,
      pdf_url: publicUrl,
    }])
    .select()
    .single();

  if (recordError) throw new Error('Invoice record creation failed: ' + recordError.message);

  revalidatePath(`/admin/orders/${orderId}`);
  return invoice;
}

export async function getInvoiceByOrder(orderId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) return null;
  return data;
}
