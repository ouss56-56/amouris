import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Order } from '@/store/orders.store'
import { StoreSettings } from '@/store/settings.store'

// Extend jsPDF for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export const generateInvoicePDF = (order: Order, settings: StoreSettings) => {
  const doc = new jsPDF()
  
  // Header - Logo / Store Name
  doc.setFontSize(24)
  doc.setTextColor(10, 61, 46) // Emerald 950
  doc.text('AMOURIS', 14, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(settings.sloganFR, 14, 26)
  
  // Invoice Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(`FACTURE : ${order.order_number.replace('AM-', 'FAC-')}`, 14, 45)
  doc.text(`Date : ${new Date(order.created_at).toLocaleDateString()}`, 14, 52)
  
  // Store Details
  doc.setFontSize(10)
  doc.text('DE :', 140, 45)
  doc.setFontSize(9)
  doc.text(settings.storeNameFR, 140, 50)
  doc.text(settings.address, 140, 55)
  doc.text(`${settings.wilaya}, Algérie`, 140, 60)
  doc.text(settings.phone, 140, 65)
  
  // Customer Details
  const customerName = order.guest_first_name 
    ? `${order.guest_first_name} ${order.guest_last_name}` 
    : 'Client Amouris'
  const customerPhone = order.guest_phone || 'N/A'
  const customerWilaya = order.guest_wilaya || 'N/A'

  doc.setFontSize(10)
  doc.text('FACTURÉ À :', 14, 75)
  doc.setFontSize(9)
  doc.text(customerName, 14, 80)
  doc.text(customerPhone, 14, 85)
  doc.text(customerWilaya, 14, 90)

  // Table
  const tableData = order.items.map(item => [
    item.product_name_fr,
    item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units} unités`,
    `${item.unit_price.toLocaleString()} DZD`,
    `${item.total_price.toLocaleString()} DZD`
  ])

  doc.autoTable({
    startY: 100,
    head: [['Produit', 'Quantité', 'Prix Unitaire', 'Total']],
    body: tableData,
    headStyles: { fillColor: [10, 61, 46] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 100 }
  })

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY
  doc.setFontSize(10)
  doc.text('Total HT :', 140, finalY + 15)
  doc.text(`${order.total_amount.toLocaleString()} DZD`, 175, finalY + 15, { align: 'right' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL TTC :', 140, finalY + 25)
  doc.text(`${order.total_amount.toLocaleString()} DZD`, 175, finalY + 25, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Montant Payé :', 140, finalY + 35)
  doc.text(`${order.amount_paid.toLocaleString()} DZD`, 175, finalY + 35, { align: 'right' })

  const reste = order.total_amount - order.amount_paid
  if (reste > 0) {
    doc.setTextColor(185, 28, 28)
  } else {
    doc.setTextColor(10, 61, 46)
  }
  doc.text('Reste à Payer :', 140, finalY + 45)
  doc.text(`${reste.toLocaleString()} DZD`, 175, finalY + 45, { align: 'right' })

  // Status Badge
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.text(order.payment_status.toUpperCase(), 14, finalY + 25)
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Merci de votre confiance. Amouris Parfums - L\'essence du luxe.', 14, 280)

  return doc
}
