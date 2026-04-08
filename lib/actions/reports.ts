'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getSalesReportData() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      order_number, 
      created_at, 
      total_amount, 
      order_status, 
      payment_status, 
      guest_first_name, 
      guest_last_name, 
      guest_phone,
      guest_wilaya,
      profiles(first_name, last_name, email, phone, wilaya),
      items:order_items(product_name_fr, quantity_grams, quantity_units, unit_price, total_price)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sales report data:', error)
    return []
  }

  // Flatten the data for Excel
  const reportData: any[] = []

  orders.forEach((o: any) => {
    const isGuest = !o.profiles
    const clientName = isGuest ? `${o.guest_first_name} ${o.guest_last_name}` : `${o.profiles.first_name} ${o.profiles.last_name || ''}`
    const phone = isGuest ? o.guest_phone : o.profiles.phone
    const wilaya = isGuest ? o.guest_wilaya : o.profiles.wilaya

    // If order has items, create a row per item to be detailed, or just a row for the order.
    // For a detailed sales report, a row per item is often better.
    if (o.items && o.items.length > 0) {
      o.items.forEach((item: any) => {
        reportData.push({
          'N° Commande': o.order_number,
          'Date': new Date(o.created_at).toLocaleDateString('fr-FR'),
          'Client': clientName?.trim(),
          'Téléphone': phone,
          'Wilaya': wilaya,
          'Produit': item.product_name_fr,
          'Qté (g)': item.quantity_grams || '-',
          'Qté (Unités)': item.quantity_units || '-',
          'Prix Unitaire': item.unit_price,
          'Total Ligne': item.total_price,
          'Total Commande': o.total_amount,
          'Statut Pmt': o.payment_status,
          'Statut Livraison': o.order_status
        })
      })
    } else {
       // fallback if no items
       reportData.push({
        'N° Commande': o.order_number,
        'Date': new Date(o.created_at).toLocaleDateString('fr-FR'),
        'Client': clientName?.trim(),
        'Téléphone': phone,
        'Wilaya': wilaya,
        'Produit': '-',
        'Qté (g)': '-',
        'Qté (Unités)': '-',
        'Prix Unitaire': '-',
        'Total Ligne': '-',
        'Total Commande': o.total_amount,
        'Statut Pmt': o.payment_status,
        'Statut Livraison': o.order_status
      })
    }
  })

  return reportData
}

export async function getInventoryReportData() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name_fr,
      category_id,
      product_type,
      stock_grams,
      status,
      categories(name_fr),
      flacon_variants(size_ml, color_name, shape, stock_units)
    `)

  if (error) {
    console.error('Error fetching inventory report data:', error)
    return []
  }

  const reportData: any[] = []

  products.forEach((p: any) => {
    if (p.product_type === 'perfume') {
      reportData.push({
        'ID Produit': p.id,
        'Nom': p.name_fr,
        'Catégorie': p.categories?.name_fr || '-',
        'Type': 'Parfum/Huile',
        'Variante': '-',
        'Stock Actuel': `${p.stock_grams || 0} g`,
        'Valeur Brut': p.stock_grams || 0,
        'Statut': p.status
      })
    } else {
      if (p.flacon_variants && p.flacon_variants.length > 0) {
        p.flacon_variants.forEach((v: any) => {
           reportData.push({
            'ID Produit': p.id,
            'Nom': p.name_fr,
            'Catégorie': p.categories?.name_fr || '-',
            'Type': 'Flacon',
            'Variante': `${v.size_ml}ml - ${v.color_name} ${v.shape || ''}`,
            'Stock Actuel': `${v.stock_units || 0} u`,
            'Valeur Brut': v.stock_units || 0,
            'Statut': p.status
          })
        })
      } else {
         reportData.push({
            'ID Produit': p.id,
            'Nom': p.name_fr,
            'Catégorie': p.categories?.name_fr || '-',
            'Type': 'Flacon',
            'Variante': 'Aucune',
            'Stock Actuel': `0 u`,
            'Valeur Brut': 0,
            'Statut': p.status
          })
      }
    }
  })

  return reportData
}

export async function getCustomersReportData() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: users, error } = await supabase
    .from('profiles')
    .select(`*`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers report:', error)
    return []
  }

  return users.map((u: any) => ({
    'ID Client': u.id,
    'Date Inscription': new Date(u.created_at).toLocaleDateString('fr-FR'),
    'Nom': u.last_name || '-',
    'Prénom': u.first_name || '-',
    'Email': u.email || '-',
    'Téléphone': u.phone || '-',
    'Wilaya': u.wilaya || '-',
    'Commune': u.commune || '-'
  }))
}
