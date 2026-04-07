"use client";

import { useI18n } from '@/i18n/i18n-context';
import { customers, orders } from '@/lib/mock-data';
import { Package, User, MapPin, ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  const { language } = useI18n();
  const customer = customers[0]; // Mock current customer
  const customerOrders = orders.filter(o => o.customerId === customer.id);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-serif text-emerald-950">
              {language === 'ar' ? `مرحباً، ${customer.firstName}` : `Bonjour, ${customer.firstName}`}
            </h1>
            <p className="text-gray-500 font-light mt-1">
              {language === 'ar' ? 'لوحة تحكم الحساب الخاص بك' : 'Tableau de bord de votre compte'}
            </p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-4 w-4 mx-2" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats & Profiles */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-emerald-50 rounded-none shadow-sm">
              <CardHeader className="bg-emerald-50/50">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-800" />
                  {language === 'ar' ? 'معلومات الملف الشخصي' : 'Informations du profil'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">{language === 'ar' ? 'الاسم بالكامل' : 'Nom Complet'}</label>
                  <p className="font-medium text-emerald-950">{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">{language === 'ar' ? 'اسم المحل' : 'Nom du magasin'}</label>
                  <p className="font-medium text-emerald-950">{customer.shopName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">{language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</label>
                  <p className="font-medium text-emerald-950">{customer.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-50 rounded-none shadow-sm">
              <CardHeader className="bg-emerald-50/50">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-800" />
                  {language === 'ar' ? 'العنوان' : 'Adresse'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-emerald-950 font-medium">{customer.wilaya}, {customer.commune}</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-50 rounded-none shadow-sm h-full">
              <CardHeader className="bg-emerald-50/50">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-800" />
                  {language === 'ar' ? 'آخر الطلبات' : 'Dernières Commandes'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {customerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {customerOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-neutral-100 hover:border-emerald-100 transition-colors">
                        <div>
                          <p className="font-medium text-emerald-950">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-end">
                          <p className="font-bold text-emerald-800">{order.total.toLocaleString()} DZD</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-neutral-100 mx-auto mb-4" />
                    <p className="text-gray-400">{language === 'ar' ? 'لا توجد طلبات حتى الآن.' : 'Aucune commande pour le moment.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
