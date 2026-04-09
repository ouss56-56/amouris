'use client'

import { InvoiceData } from '@/store/orders.store'

export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const emerald = '#0a3d2e'
  const gold = '#C9A84C'
  const lightGray = '#f9f9f9'

  // --- Zone 1: Header ---
  doc.setFillColor(emerald)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor('#ffffff')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('AMOURIS PARFUMS', 15, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text("L'essence du luxe — Huiles et flacons d'exception", 15, 28)

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', 140, 18)
  
  doc.setFontSize(10)
  doc.setTextColor(gold)
  doc.text(data.invoice_number, 140, 26)
  
  doc.setTextColor('#ffffff')
  doc.text(`Date: ${new Date(data.generated_at).toLocaleDateString()}`, 140, 32)

  // --- Zone 2: Addresses ---
  doc.setTextColor('#000000')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  
  // From
  doc.text('FACTURÉ PAR :', 15, 55)
  doc.setFont('helvetica', 'normal')
  doc.text(data.shop_name, 15, 62)
  doc.text(data.shop_address, 15, 67)
  doc.text(`Tél: ${data.shop_phone}`, 15, 72)
  doc.text(`Email: ${data.shop_email}`, 15, 77)

  // To
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURÉ À :', 120, 55)
  doc.setFont('helvetica', 'normal')
  doc.text(data.client_name, 120, 62)
  if (data.client_shop) doc.text(data.client_shop, 120, 67)
  doc.text(`${data.client_wilaya}${data.client_commune ? `, ${data.client_commune}` : ''}`, 120, 72)
  doc.text(`Tél: ${data.client_phone}`, 120, 77)
  
  doc.setFontSize(8)
  doc.setTextColor(data.is_registered ? '#059669' : '#6b7280')
  doc.text(data.is_registered ? 'Client enregistré' : 'Commande invité', 120, 83)

  // --- Zone 3: Order Ref ---
  doc.setDrawColor(emerald)
  doc.setLineWidth(0.5)
  doc.line(15, 90, 195, 90)
  
  doc.setTextColor('#000000')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(`Commande N° ${data.order_number}`, 15, 98)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date commande: ${data.order_date}`, 80, 98)
  doc.text(`Statut paiement: ${data.payment_status.toUpperCase()}`, 140, 98)

  // --- Zone 4: Table ---
  const tableRows = data.items.map(item => [
    item.description,
    item.quantity,
    `${item.unit_price.toLocaleString()} DZD`,
    `${item.total.toLocaleString()} DZD`
  ])

  autoTable(doc, {
    startY: 105,
    head: [['Désignation', 'Quantité', 'Prix Unitaire', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: emerald, textColor: '#ffffff', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: lightGray },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 }
  })

  // --- Zone 5: Totals ---
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFont('helvetica', 'normal')
  doc.text('Sous-total :', 140, finalY)
  doc.text(`${data.subtotal.toLocaleString()} DZD`, 175, finalY, { align: 'right' })
  
  doc.setDrawColor('#eeeeee')
  doc.line(140, finalY + 2, 195, finalY + 2)
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL :', 140, finalY + 10)
  doc.text(`${data.total.toLocaleString()} DZD`, 175, finalY + 10, { align: 'right' })

  doc.setFontSize(10)
  doc.setTextColor('#059669')
  doc.text('Montant payé :', 140, finalY + 18)
  doc.text(`${data.amount_paid.toLocaleString()} DZD`, 175, finalY + 18, { align: 'right' })

  doc.setTextColor(data.remaining > 0 ? '#dc2626' : '#6b7280')
  doc.text('Reste à payer :', 140, finalY + 25)
  doc.text(`${data.remaining.toLocaleString()} DZD`, 175, finalY + 25, { align: 'right' })

  // --- Zone 6: Status Badge ---
  const badgeY = finalY + 35
  if (data.payment_status === 'paid') {
    doc.setFillColor('#ecfdf5')
    doc.rect(15, badgeY, 180, 10, 'F')
    doc.setTextColor('#065f46')
    doc.setFontSize(10)
    doc.text('✓ COMMANDE INTÉGRALEMENT RÉGLÉE', 105, badgeY + 6.5, { align: 'center' })
  } else if (data.payment_status === 'partial') {
    doc.setFillColor('#fff7ed')
    doc.rect(15, badgeY, 180, 10, 'F')
    doc.setTextColor('#9a3412')
    doc.text(`⚠ PAIEMENT PARTIEL — Reste ${data.remaining.toLocaleString()} DZD`, 105, badgeY + 6.5, { align: 'center' })
  } else {
    doc.setFillColor('#fef2f2')
    doc.rect(15, badgeY, 180, 10, 'F')
    doc.setTextColor('#991b1b')
    doc.text('✗ EN ATTENTE DE PAIEMENT', 105, badgeY + 6.5, { align: 'center' })
  }

  // --- Zone 7: Footer ---
  doc.setDrawColor(emerald)
  doc.setLineWidth(0.5)
  doc.line(15, 275, 195, 275)
  
  doc.setTextColor('#6b7280')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Merci pour votre confiance — أشكركم على ثقتكم', 105, 282, { align: 'center' })
  doc.text('Paiement à la livraison uniquement | www.amouris-parfums.com', 105, 287, { align: 'center' })

  doc.save(`facture-${data.invoice_number}.pdf`)
}
