import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Order } from '@/store/orders.store'
import { StoreSettings } from '@/store/settings.store'

export const generateInvoicePDF = async (order: Order, settings: StoreSettings) => {
  if (!order) throw new Error("Order data is missing");
  const safeItems = order.items || [];
  const safeSettings = settings || {
    storeNameFR: 'Amouris Parfums',
    storeNameAR: 'أموريس للعطور',
    sloganFR: 'L\'essence du luxe',
    sloganAR: 'جوهر الفخامة',
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
  doc.rect(0, 0, 210, 50, 'F')
  
  // Logo placeholder or Image
  try {
    // Attempt to add logo if it exists in public
    doc.addImage('/logo.png', 'PNG', 14, 10, 30, 30)
  } catch (e) {
    // Fallback to text logo
    doc.setFontSize(28)
    doc.setTextColor(255, 255, 255)
    doc.text('AMOURIS', 14, 25)
  }
  
  // Store Name & Slogan (Adjusted if logo is present)
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('AMOURIS PARFUMS', 50, 22)
  doc.setFontSize(14)
  doc.setTextColor(...GOLD as [number, number, number])
  doc.text('أموريس للعطور', 50, 29)
  
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(safeSettings.sloganFR || "L'essence du luxe — Huiles et flacons d'exception", 50, 37)
  
  // Invoice Banner
  doc.setFillColor(...GOLD as [number, number, number])
  doc.rect(140, 15, 56, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE / فاتورة', 168, 23, { align: 'center' })

  // Document Details
  doc.setTextColor(...TEXT_DARK as [number, number, number])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAILS DOCUMENT / تفاصيل الوثيقة', 14, 65)
  doc.setDrawColor(230, 230, 230)
  doc.line(14, 67, 85, 67)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text(`N° Facture:`, 14, 75)
  doc.setTextColor(0, 0, 0)
  const invoiceNo = order.order_number?.replace('AM-', 'FAC-') || `FAC-${order.id?.slice(0, 8).toUpperCase()}`
  doc.text(`${invoiceNo}`, 45, 75)
  
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text(`Date Emission:`, 14, 81)
  doc.setTextColor(0, 0, 0)
  doc.text(`${new Date(order.created_at || Date.now()).toLocaleDateString('fr-FR')}`, 45, 81)

  // From / To columns
  doc.setTextColor(...TEXT_DARK as [number, number, number])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ÉMETTEUR / المرسل', 110, 65)
  doc.line(110, 67, 196, 67)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text('AMOURIS PARFUMS', 110, 75)
  
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.setFontSize(8)
  const storeInfo = [
    safeSettings.address || 'Quartier El Yasmine, Alger',
    `Tél: ${safeSettings.phone || '+213 550 00 00 00'}`,
    `Email: ${safeSettings.email || 'contact@amouris-parfums.com'}`,
    `RC: 23/00-1234567B22 | NIF: 002231012345678`,
    `AI: 16101234567`
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
  doc.text('DESTINATAIRE / المرسل إليه', 14, 105)
  doc.line(14, 107, 100, 107)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(customerName.toUpperCase(), 14, 115)
  
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
    statusText = 'PARTIELLE'
    statusColor = [245, 158, 11]
  }

  doc.setFillColor(...statusColor)
  doc.roundedRect(160, 105, 36, 8, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(statusText, 178, 110.5, { align: 'center' })

  // Table
  const tableData = safeItems.map(item => [
    item.product_name_fr || 'Produit',
    item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units || 0} pcs`,
    `${(item.unit_price || 0).toLocaleString()} DZD`,
    `${(item.total_price || 0).toLocaleString()} DZD`
  ])

  autoTable(doc, {
    startY: 140,
    head: [['DÉSIGNATION / الوصف', 'QTE / الكمية', 'P.U / السعر', 'TOTAL / المجموع']],
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
      cellPadding: 4
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
  doc.text('TOTAL TTC / المجموع:', summaryX + 4, finalY + 26.5)
  doc.text(`${(order.total_amount || 0).toLocaleString()} DZD`, 192, finalY + 26.5, { align: 'right' })

  // Paid & Remaining
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text('Montant payé / المدفوع:', summaryX, finalY + 38)
  doc.setTextColor(0, 0, 0)
  doc.text(`${(order.amount_paid || 0).toLocaleString()} DZD`, 196, finalY + 38, { align: 'right' })
  
  const reste = (order.total_amount || 0) - (order.amount_paid || 0)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...(reste > 0 ? [185, 28, 28] : EMERALD_DARK) as [number, number, number])
  doc.text('RESTE À PAYER / الباقي:', summaryX, finalY + 45)
  doc.text(`${reste.toLocaleString()} DZD`, 196, finalY + 45, { align: 'right' })
  
  // Bank Info
  doc.setTextColor(...TEXT_DARK as [number, number, number])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('COORDONNÉES BANCAIRES / معلومات البنك', 14, finalY + 15)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text(`RIB: 007 99999 0000000000 00`, 14, finalY + 20)
  doc.text(`Banque: BNA - Alger Central`, 14, finalY + 24)

  // Bottom Signature Area
  doc.setDrawColor(230, 230, 230)
  doc.line(14, finalY + 60, 196, finalY + 60)
  
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_GRAY as [number, number, number])
  doc.text('Cachet et Signature / الختم والتوقيع', 14, finalY + 70)
  doc.rect(14, finalY + 74, 50, 25)
  
  doc.text('Signature Client', 150, finalY + 70)
  doc.rect(140, finalY + 74, 56, 25)

  // Luxury Background Element (Watermark/Seal)
  doc.setGState(new (doc as any).GState({ opacity: 0.05 }))
  doc.addImage('/logo.png', 'PNG', 60, 100, 90, 90)
  doc.setGState(new (doc as any).GState({ opacity: 1 }))

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text(`Document généré par Amouris Système — L'essence du luxe`, 105, 282, { align: 'center' })
  doc.text(`www.amouris-parfums.com — contact@amouris-parfums.com`, 105, 287, { align: 'center' })

  return doc
}
