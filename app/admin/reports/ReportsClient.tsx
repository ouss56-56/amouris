'use client'

import { useState } from 'react'
import { FileSpreadsheet, Download, Activity, Users, Package, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ReportsClientProps {
  orders: any[]
  customers: any[]
  products: any[]
}

export default function ReportsClient({ orders, customers, products }: ReportsClientProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const downloadExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Amouris")
    
    // Auto-size columns (simple approach)
    const max_width = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet["!cols"] = Array(max_width).fill({ wch: 20 });

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleDownloadSales = () => {
    setLoading('sales')
    setTimeout(() => {
        const data = orders.map(o => ({
            "N° Commande": o.order_number,
            "Date": new Date(o.created_at).toLocaleString(),
            "Client": o.guest_first_name ? `${o.guest_first_name} ${o.guest_last_name}` : (o.customer?.first_name ? `${o.customer.first_name} ${o.customer.last_name}` : 'Client Enregistré'),
            "Téléphone": o.guest_phone || '-',
            "Wilaya": o.guest_wilaya || '-',
            "Montant Total": o.total_amount,
            "Montant Payé": o.amount_paid,
            "Statut Commande": o.order_status,
            "Statut Paiement": o.payment_status,
            "Articles": o.items.map((i: any) => `${i.product_name_fr} (${i.quantity_grams || i.quantity_units})`).join(', ')
        }))
        downloadExcel(data, 'Amouris_Ventes')
        setLoading(null)
    }, 500)
  }

  const handleDownloadInventory = () => {
    setLoading('inventory')
    setTimeout(() => {
        const data: any[] = []
        products.forEach(p => {
            if (p.product_type === 'perfume') {
                data.push({
                    "Produit": p.name_fr,
                    "Type": "Parfum / Huile",
                    "Variante": "N/A",
                    "Stock": `${p.stock_grams}g`,
                    "Prix Base": p.price_per_gram ? `${p.price_per_gram} DZD/g` : '-',
                    "Statut": p.status
                })
            } else {
                p.variants?.forEach((v: any) => {
                    data.push({
                        "Produit": p.name_fr,
                        "Type": "Flacon / Carafe",
                        "Variante": `${v.size_ml}ml - ${v.color_name}`,
                        "Stock": `${v.stock_units} unités`,
                        "Prix Base": `${v.price} DZD`,
                        "Statut": p.status
                    })
                })
            }
        })
        downloadExcel(data, 'Amouris_Inventaire')
        setLoading(null)
    }, 500)
  }

  const handleDownloadCustomers = () => {
    setLoading('customers')
    setTimeout(() => {
        const data = customers.map(c => ({
            "Nom": c.last_name,
            "Prénom": c.first_name,
            "Téléphone": c.phone,
            "Email": c.email || '-',
            "Magasin": c.shop_name || '-',
            "Wilaya": c.wilaya,
            "Commune": c.commune || '-',
            "Inscrit le": new Date(c.created_at || '').toLocaleDateString(),
            "Statut": c.is_frozen ? 'Suspendu' : 'Actif'
        }))
        downloadExcel(data, 'Amouris_Clients')
        setLoading(null)
    }, 500)
  }

  const reports = [
    {
      id: 'sales',
      title: 'Rapport des Ventes',
      description: 'Export de toutes les commandes détaillées par ligne de produit, avec statuts et informations clients.',
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      action: handleDownloadSales
    },
    {
      id: 'inventory',
      title: 'État de l\'Inventaire',
      description: 'Vision complète du stock actuel (parfums en grammes et flacons en unités) avec alertes critiques.',
      icon: Package,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      action: handleDownloadInventory
    },
    {
      id: 'customers',
      title: 'Base Clients',
      description: 'Export complet de la base de données clients inscrits avec coordonnées et localisation (Wilaya).',
      icon: Users,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      action: handleDownloadCustomers
    }
  ]

  return (
    <div className="space-y-12 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bold italic">Bibliothèque de Rapports</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Exportation de données pour analyse externe</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-10 rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500">
             <div>
                <div className={`w-16 h-16 ${report.bgColor} ${report.color} rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-all`}>
                   <report.icon size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-emerald-950 mb-4 italic">{report.title}</h3>
                <p className="text-xs text-emerald-950/40 leading-relaxed font-medium min-h-[4rem]">
                  {report.description}
                </p>
             </div>
             
             <div className="pt-10 mt-6 border-t border-emerald-950/5">
                <button
                  onClick={report.action}
                  disabled={loading !== null}
                  className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all
                    ${loading === report.id 
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                      : 'bg-emerald-950 text-white hover:bg-emerald-900 shadow-2xl shadow-emerald-900/20 active:scale-95'
                    }
                  `}
                >
                  {loading === report.id ? (
                    <><Loader2 size={16} className="animate-spin" /> Préparation...</>
                  ) : (
                    <><Download size={16} /> Téchercher (.xlsx)</>
                  )}
                </button>
             </div>
          </div>
        ))}
      </div>

      <section className="bg-neutral-900 rounded-[3rem] p-12 text-white/40 flex flex-col md:flex-row items-center gap-8 border border-white/5 shadow-2xl overflow-hidden relative group">
         <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
         <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
            <Activity size={32} />
         </div>
         <div className="flex-1 text-center md:text-left">
            <p className="text-white text-lg font-serif mb-1 font-bold italic">Rapports temps réel</p>
            <p className="text-xs font-medium max-w-lg">
               Les données exportées reflètent l'état actuel de votre boutique Amouris. 
               Ces fichiers sont compatibles avec Microsoft Excel, Google Sheets et Numbers.
            </p>
         </div>
      </section>
    </div>
  )
}
