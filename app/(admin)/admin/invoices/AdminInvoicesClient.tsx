"use client";

import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface AdminInvoicesClientProps {
  initialInvoices: {
    id: string;
    invoice_number: string;
    created_at: string;
    order_id: string;
    pdf_url: string;
  }[];
}

export default function AdminInvoicesClient({ initialInvoices }: AdminInvoicesClientProps) {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = initialInvoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'الفواتير' : 'Factures'}
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={language === 'ar' ? 'بحث برقم الفاتورة...' : 'Rechercher par numéro...'} 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInvoices.map((inv) => (
          <Card key={inv.id} className="overflow-hidden hover:border-primary transition-colors">
            <CardContent className="p-0">
               <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">{inv.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/orders/${inv.order_id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                         {language === 'ar' ? 'عرض الطلب' : 'Voir Commande'}
                      </Button>
                    </Link>
                    <Link href={inv.pdf_url} target="_blank">
                      <Button size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        PDF
                      </Button>
                    </Link>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد فواتير مطابقة' : 'Aucune facture trouvée.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
