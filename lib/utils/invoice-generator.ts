import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Order } from '@/store/orders.store'
import { StoreSettings } from '@/store/settings.store'

export const generateInvoicePDF = async (order: Order, settings: StoreSettings) => {
  if (!order) throw new Error("Données de commande manquantes");
  const safeItems = order.items || [];
  const safeSettings = settings || {
    storeNameFR: 'Amouris Parfums',
    sloganFR: 'L\'essence du luxe',
    address: 'Alger, Algérie',
    wilaya: 'Alger',
    phone: '+213 550 00 00 00',
    email: 'contact@amouris-parfums.com'
  };

  const doc = new jsPDF()
  
  // Design Colors
  const EMERALD_DARK = [10, 61, 46]
  const GOLD = [201, 168, 76]
  const LIGHT_GRAY = [245, 245, 245]
  const TEXT_GRAY = [100, 100, 100]
  const TEXT_DARK = [30, 30, 30]

  // Header Background Bar
  doc.setFillColor(...EMERALD_DARK as [number, number, number])
  doc.rect(0, 0, 210, 45, 'F')
  
  // Store Name & Logo Text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.text('AMOURIS PARFUMS', 14, 25)
  
  // Slogan
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD as [number, number, number])
  doc.text(safeSettings.sloganFR || "L'essence du luxe — Huiles et flacons d'exception", 14, 33)
  
  // Invoice Banner
  doc.setFillColor(...GOLD as [number, number, number])
  doc.rect(140, 15, 56, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', 168, 23.5, { align: 'center' })

  // Document Details Area
  doc.setTextColor(...TEXT_DARK as [number, number, number])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAILS DU DOCUMENT', 14, 65)
  doc.setDrawColor(230, 230, 230)
  doc.line(14, 67, 85, 67)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text(`N° Facture:`, 14, 75)
  doc.setTextColor(0, 0, 0)
  const invoiceNo = order.order_number?.replace('AM-', 'FAC-') || `FAC-${order.id?.slice(0, 8).toUpperCase()}`
  doc.text(`${invoiceNo}`, 45, 75)
  
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text(`Date d'émission:`, 14, 81)
  doc.setTextColor(0, 0, 0)
  doc.text(`${new Date(order.created_at || Date.now()).toLocaleDateString('fr-FR')}`, 45, 81)

  // From / To columns
  doc.setTextColor(...TEXT_DARK as [number, number, number])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ÉMETTEUR', 110, 65)
  doc.line(110, 67, 196, 67)
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text('AMOURIS PARFUMS', 110, 75)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.setFontSize(8)
  const storeInfo = [
    safeSettings.address || 'Quartier El Yasmine, Alger',
    `Tél: ${safeSettings.phone || '+213 550 00 00 00'}`,
    `Email: ${safeSettings.email || 'contact@amouris-parfums.com'}`
  ]
  doc.text(storeInfo, 110, 80)

  // Client info extraction
  const customer = (order as any).customer;
  const customerName = order.guest_first_name 
    ? `${order.guest_first_name} ${order.guest_last_name}` 
    : (customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Client Partenaire' : 'Client Amouris');
  
  const customerPhone = order.guest_phone || customer?.phone || 'N/A';
  const customerWilaya = order.guest_wilaya || customer?.wilaya || 'N/A';
  const customerAddress = order.shipping_address || customer?.address || 'Non spécifiée';

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT_DARK as [number, number, number])
  doc.text('DESTINATAIRE', 14, 105)
  doc.line(14, 107, 100, 107)
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(customerName.toUpperCase(), 14, 115)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.setFontSize(8)
  const customerInfoList = [
    `Tél: ${customerPhone}`,
    `Wilaya: ${customerWilaya}`,
    `Adresse: ${customerAddress}`
  ]
  doc.text(customerInfoList, 14, 120)

  // Status Badge
  const status = (order.payment_status || 'unpaid').toUpperCase()
  const isPaid = status === 'PAID'
  const isPartial = status === 'PARTIAL'
  
  let statusText = 'NON RÉGLÉE'
  let statusColor = [239, 68, 68]
  if (isPaid) {
    statusText = 'RÉGLÉE'
    statusColor = [16, 185, 129]
  } else if (isPartial) {
    statusText = 'RÈGLEMENT PARTIEL'
    statusColor = [245, 158, 11]
  }

  doc.setFillColor(...statusColor)
  doc.roundedRect(155, 105, 41, 8, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(statusText, 175.5, 110.5, { align: 'center' })

  // Table
  const tableData = safeItems.map(item => [
    item.product_name_fr || 'Produit',
    item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units || 0} pcs`,
    `${(item.unit_price || 0).toLocaleString()} DZD`,
    `${(item.total_price || 0).toLocaleString()} DZD`
  ])

  autoTable(doc, {
    startY: 140,
    head: [['DÉSIGNATION', 'QUANTITÉ', 'PRIX UNITAIRE', 'TOTAL HT']],
    body: tableData,
    headStyles: { 
      fillColor: EMERALD_DARK as [number, number, number], 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40 }
    },
    bodyStyles: { 
      fontSize: 8,
      cellPadding: 4,
      font: 'helvetica'
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY as [number, number, number] },
    margin: { left: 14, right: 14 },
    theme: 'grid'
  })

  // Financial Summary
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  const summaryX = 130
  
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text('Sous-total:', summaryX, finalY + 15)
  doc.setTextColor(0, 0, 0)
  doc.text(`${(order.total_amount || 0).toLocaleString()} DZD`, 196, finalY + 15, { align: 'right' })
  
  doc.setFillColor(...EMERALD_DARK as [number, number, number])
  doc.rect(summaryX, finalY + 20, 66, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL TTC:', summaryX + 4, finalY + 26.5)
  doc.text(`${(order.total_amount || 0).toLocaleString()} DZD`, 192, finalY + 26.5, { align: 'right' })

  // Paid & Remaining
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text('Montant déjà versé:', summaryX, finalY + 38)
  doc.setTextColor(0, 0, 0)
  doc.text(`${(order.amount_paid || 0).toLocaleString()} DZD`, 196, finalY + 38, { align: 'right' })
  
  const reste = (order.total_amount || 0) - (order.amount_paid || 0)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...(reste > 0 ? [185, 28, 28] : EMERALD_DARK) as [number, number, number])
  doc.text('NET À PAYER:', summaryX, finalY + 45)
  doc.text(`${reste.toLocaleString()} DZD`, 196, finalY + 45, { align: 'right' })
  

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text(`Document généré par Amouris Système — L'essence du luxe`, 105, 282, { align: 'center' })
  doc.text(`www.amouris-parfums.com — contact@amouris-parfums.com`, 105, 287, { align: 'center' })

  return doc
}
