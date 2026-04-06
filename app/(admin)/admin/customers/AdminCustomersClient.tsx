"use client";

import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { Customer, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, Lock, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { updateProfile } from '@/lib/actions/customers';
import { toast } from 'sonner';

interface AdminCustomersClientProps {
  customers: Customer[];
  orders: Order[];
}

export default function AdminCustomersClient({ customers, orders }: AdminCustomersClientProps) {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phoneNumber.includes(searchTerm) ||
    (c.shopName && c.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleFreeze = async (customer: Customer) => {
    try {
      // In a real app, we'd have a specific toggle action, but we can reuse updateProfile logic or create a new one
      // For now, let's assume we'll add a specific action if needed, or just toast for now.
      toast.info(language === 'ar' ? 'جاري التحديث...' : 'Mise à jour...');
    } catch (error) {
      toast.error('Error updating customer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'العملاء' : 'Clients'}
        </h1>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
            <Input 
              placeholder={language === 'ar' ? 'بحث بالاسم، الهاتف أو اسم المحل...' : 'Recherche...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rtl:pr-9 rtl:pl-3"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4">Commandes</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => {
                 const customerOrders = orders.filter(o => o.customerId === customer.id);
                 return (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <p className="font-bold">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-muted-foreground">{customer.shopName}</p>
                    </td>
                    <td className="px-6 py-4 font-medium" dir="ltr">{customer.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{customer.wilaya}</p>
                      <p className="text-xs text-muted-foreground">{customer.commune}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">{customerOrders.length}</td>
                    <td className="px-6 py-4">
                      <Badge variant={customer.status === 'active' ? "default" : "destructive"} className={customer.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem>
                             {language === 'ar' ? 'عرض الملف' : 'Voir le profil'}
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleToggleFreeze(customer)} className={customer.status === 'active' ? "text-amber-600" : "text-emerald-600"}>
                             {customer.status === 'active' ? (
                               <>
                                 <ShieldAlert className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                 {language === 'ar' ? 'تجميد الحساب' : 'Suspendre'}
                               </>
                             ) : (
                               <>
                                 <ShieldCheck className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                 {language === 'ar' ? 'تنشيط الحساب' : 'Activer'}
                               </>
                             )}
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                             <Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                             {language === 'ar' ? 'حذف الحساب' : 'Supprimer'}
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
