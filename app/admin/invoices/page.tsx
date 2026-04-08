"use client";

import { useState, useMemo } from 'react';
import { useOrdersStore, Order } from '@/store/orders.store';
import { FileText, Search, Download, Printer, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminInvoicesPage() {
  const { orders } = useOrdersStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const name = o.guest_first_name ? `${o.guest_first_name} ${o.guest_last_name}` : 'Client Enregistré';
      const s = search.toLowerCase();
      return o.order_number.toLowerCase().includes(s) || name.toLowerCase().includes(s);
    });
  }, [orders, search]);

  const generatePDF = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 61, 46); // Emerald 950
    doc.text('AMOURIS PARFUMS', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('FACTURE OFFICIELLE', 14, 28);
    doc.text(`N° Facture: INV-${order.order_number.split('-')[1]}`, 140, 28);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 33);

    // Client Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('DESTINATAIRE:', 14, 50);
    doc.setFontSize(10);
    const name = order.guest_first_name ? `${order.guest_first_name} ${order.guest_last_name}` : `Client ID: ${order.customer_id}`;
    doc.text(name, 14, 57);
    doc.text(`Tél: ${order.guest_phone || 'N/A'}`, 14, 62);
    doc.text(`Wilaya: ${order.guest_wilaya || 'N/A'}`, 14, 67);

    // Items Table
    autoTable(doc, {
      startY: 80,
      head: [['Produit', 'Détails', 'Prix Unitaire', 'Total']],
      body: order.items.map(item => [
        item.product_name_fr,
        item.quantity_grams ? `${item.quantity_grams}g` : `${item.quantity_units} unités`,
        `${item.unit_price} DZD`,
        `${item.total_price} DZD`
      ]),
      headStyles: { fillColor: [10, 61, 46], textColor: [255, 255, 255] },
      margin: { top: 80 }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(201, 168, 76); // Gold #C9A84C
    doc.text(`TOTAL À PAYER: ${order.total_amount.toLocaleString()} DZD`, 120, finalY + 10);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Merci pour votre commande chez Amouris.', 14, finalY + 30);
    doc.text('Cette facture est générée électroniquement.', 14, finalY + 35);

    doc.save(`Facture_Amouris_${order.order_number}.pdf`);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2">Comptabilité</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Gestion des factures & Pièces comptables</p>
        </div>
      </header>

      <section className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
           <input 
             type="text"
             placeholder="Rechercher par N° de Commande ou Nom Client..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all"
           />
        </div>
      </section>

      <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">N° Facture</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Commande Liée</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Client</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Montant Total</th>
                <th className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((order) => {
                  const name = order.guest_first_name ? `${order.guest_first_name} ${order.guest_last_name}` : `Client #${order.customer_id?.slice(0, 5)}`;
                  const invoiceNumber = `INV-${order.order_number.split('-')[1]}`;
                  return (
                    <motion.tr 
                      layout
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-10 py-8">
                        <div>
                          <p className="font-mono font-bold text-emerald-950">{invoiceNumber}</p>
                          <p className="text-[9px] font-black tracking-widest text-emerald-950/20 uppercase mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">{order.order_number}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div>
                          <p className="text-sm font-bold text-emerald-950">{name}</p>
                          <p className="text-[10px] text-emerald-950/40 font-medium">{order.guest_wilaya || '—'}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-serif text-xl text-emerald-950">{order.total_amount.toLocaleString()} <span className="text-xs font-normal">DZD</span></p>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => generatePDF(order)}
                              className="w-12 h-12 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm"
                              title="Télécharger la facture"
                            >
                               <Download size={16} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center">
             <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-100">
                <FileText size={32} />
             </div>
             <p className="font-serif text-2xl text-emerald-950/20 italic">Aucune facture disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
}
