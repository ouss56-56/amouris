'use client'

import { useState, useMemo } from 'react';
import { FileText, Search, Download, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoicePDF } from '@/lib/utils/invoice-generator';
import { deleteInvoiceAction } from '@/lib/actions/invoices';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InvoicesClientProps {
  initialOrders: any[]
}

export default function InvoicesClient({ initialOrders }: InvoicesClientProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return initialOrders.filter(o => {
      const name = o.guest_first_name ? `${o.guest_first_name} ${o.guest_last_name}` : 'Client Enregistré';
      const s = search.toLowerCase();
      return o.order_number.toLowerCase().includes(s) || name.toLowerCase().includes(s);
    });
  }, [initialOrders, search]);

  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDownload = async (order: any) => {
    try {
      // Data enrichment if needed (settings usually needed but generator has defaults)
      const doc = await generateInvoicePDF(order, {} as any);
      doc.save(`Facture_Amouris_${order.order_number}.pdf`);
      toast.success('Facture générée avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de la génération: ' + err.message);
    }
  };

  const handleDelete = async (order: any) => {
    if (!confirm(`Voulez-vous supprimer l'enregistrement de la facture pour la commande ${order.order_number} ?`)) return;
    
    setIsDeleting(order.id);
    try {
      await deleteInvoiceAction(order.id);
      router.refresh();
      toast.success('Facture supprimée');
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bold italic">Comptabilité</h1>
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
             className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
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
                      className="group hover:bg-neutral-50/50 transition-colors font-sans"
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
                        <p className="font-serif text-xl text-emerald-950 font-bold">{order.total_amount.toLocaleString()} <span className="text-xs font-normal">DZD</span></p>
                      </td>
                       <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3 transition-opacity">
                             <button 
                               onClick={() => handleDownload(order)}
                               className="w-12 h-12 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm"
                               title="Télécharger la facture"
                             >
                                <Download size={16} />
                             </button>
                             <button 
                               onClick={() => handleDelete(order)}
                               disabled={isDeleting === order.id}
                               className="w-12 h-12 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                               title="Supprimer la facture"
                             >
                                {isDeleting === order.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
