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

export const generateInvoicePDF = async (order: Order, settings: StoreSettings) => {
  if (!order) throw new Error("Order data is missing");
  const safeItems = order.items || [];
  const safeSettings = settings || {
    storeNameFR: 'Amouris Parfums',
    sloganFR: 'L\'essence du luxe',
    address: 'Alger, Algérie',
    wilaya: 'Alger',
    phone: '',
    email: ''
  };

  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')
  const doc = new jsPDF()
  
  // Design Colors
  const EMERALD_DARK = [10, 61, 46]
  const GOLD = [201, 168, 76]
  const LIGHT_GRAY = [245, 245, 245]
  const TEXT_GRAY = [100, 100, 100]

  // Header Background Bar
  doc.setFillColor(...EMERALD_DARK)
  doc.rect(0, 0, 210, 45, 'F')
  
  // Store Name / Logo
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('AMOURIS', 14, 25)
  
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(safeSettings.sloganFR || 'L\'essence du luxe', 14, 33)
  
  // Invoice Banner
  doc.setFillColor(...GOLD)
  doc.rect(140, 15, 56, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', 168, 23, { align: 'center' })

  // Document Details
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAILS DOCUMENT', 14, 55)
  doc.setDrawColor(230, 230, 230)
  doc.line(14, 57, 80, 57)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY)
  doc.text(`N° Facture:`, 14, 65)
  doc.setTextColor(0, 0, 0)
  doc.text(`${order.order_number?.replace('AM-', 'FAC-') || 'N/A'}`, 40, 65)
  
  doc.setTextColor(...TEXT_GRAY)
  doc.text(`Date Emission:`, 14, 71)
  doc.setTextColor(0, 0, 0)
  doc.text(`${new Date(order.created_at || Date.now()).toLocaleDateString()}`, 40, 71)

  // From / To columns
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ÉMETTEUR', 110, 55)
  doc.line(110, 57, 196, 57)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(safeSettings.storeNameFR || 'Amouris Parfums', 110, 65)
  doc.setTextColor(...TEXT_GRAY)
  doc.setFontSize(8)
  const storeInfo = [
    safeSettings.address || '',
    safeSettings.wilaya || '',
    safeSettings.phone || '',
    safeSettings.email || ''
  ].filter(Boolean)
  doc.text(storeInfo, 110, 70)

  const customerName = order.guest_first_name 
    ? `${order.guest_first_name} ${order.guest_last_name}` 
    : 'Client Amouris'
  const customerPhone = order.guest_phone || 'N/A'
  const customerWilaya = order.guest_wilaya || 'N/A'

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('DESTINATAIRE', 14, 95)
  doc.line(14, 97, 100, 97)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(customerName, 14, 105)
  doc.setTextColor(...TEXT_GRAY)
  doc.setFontSize(8)
  const customerInfo = [
    customerPhone,
    customerWilaya,
    order.shipping_address || ''
  ].filter(Boolean)
  doc.text(customerInfo, 14, 110)

  // Status Badge
  const status = (order.payment_status || 'unpaid').toUpperCase()
  const isPaid = status === 'PAID'
  doc.setFillColor(...(isPaid ? [16, 185, 129] : [239, 68, 68]))
  doc.roundedRect(160, 95, 36, 8, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(isPaid ? 'RÉGLÉE' : 'NON RÉGLÉE', 178, 100.5, { align: 'center' })

  // Table
  const tableData = safeItems.map(item => [
    item.product_name_fr || 'Produit',
    item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units || 0} u.`,
    `${(item.unit_price || 0).toLocaleString()} DZD`,
    `${(item.total_price || 0).toLocaleString()} DZD`
  ])

  doc.autoTable({
    startY: 125,
    head: [['DÉSIGNATION', 'QTE', 'PRIX UNITAIRE', 'TOTAL']],
    body: tableData,
    headStyles: { 
      fillColor: EMERALD_DARK, 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { 
      fontSize: 8,
      cellPadding: 4
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
    theme: 'striped'
  })

  // Financial Summary
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  const summaryX = 140
  
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_GRAY)
  doc.text('Total Net:', summaryX, finalY + 15)
  doc.setTextColor(0, 0, 0)
  doc.text(`${(order.total_amount || 0).toLocaleString()} DZD`, 196, finalY + 15, { align: 'right' })
  
  doc.setFillColor(...EMERALD_DARK)
  doc.rect(summaryX, finalY + 20, 56, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL TTC:', summaryX + 4, finalY + 26)
  doc.text(`${(order.total_amount || 0).toLocaleString()} DZD`, 192, finalY + 26, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY)
  doc.text('Acompte payé:', summaryX, finalY + 38)
  doc.setTextColor(0, 0, 0)
  doc.text(`${(order.amount_paid || 0).toLocaleString()} DZD`, 196, finalY + 38, { align: 'right' })

  const reste = (order.total_amount || 0) - (order.amount_paid || 0)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(reste > 0 ? [185, 28, 28] : EMERALD_DARK)
  doc.text('RESTE À PAYER:', summaryX, finalY + 45)
  doc.text(`${reste.toLocaleString()} DZD`, 196, finalY + 45, { align: 'right' })

  // Bottom Signature Area
  doc.setDrawColor(230, 230, 230)
  doc.line(14, finalY + 60, 196, finalY + 60)
  
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_GRAY)
  doc.text('Cachet de l\'entreprise', 14, finalY + 70)
  doc.rect(14, finalY + 74, 50, 20)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text(`Document généré par Amouris Système - L'essence du luxe - ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' })

  return doc
}
