"use client";

import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { wilayas } from '@/lib/wilayas';
import { toast } from 'sonner';
import { Settings, Save, ShieldCheck, Lock, UserCircle } from 'lucide-react';
import { useCustomersStore, Customer } from '@/store/customers.store';
import { useCustomerAuthStore } from '@/store/customer-auth.store';
import { motion } from 'framer-motion';

export default function SettingsClient() {
  const { language } = useI18n();
  const { customer, setCustomer } = useCustomerAuthStore();
  const { update, resetPassword } = useCustomersStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const isAr = language === 'ar';

  const [profileData, setProfileData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    shop_name: customer?.shop_name || '',
    wilaya: customer?.wilaya || '',
    commune: customer?.commune || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!customer) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const res = update(customer.id, profileData);
    if (res.ok && res.customer) {
      setCustomer(res.customer);
      toast.success(isAr ? 'تم تحديث البيانات بنجاح' : 'Profil mis à jour avec succès');
    } else {
      toast.error(res.error || (isAr ? 'خطأ في التحديث' : 'Erreur lors de la mise à jour'));
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.oldPassword !== customer.password_hash) {
      toast.error(isAr ? 'كلمة المرور القديمة غير صحيحة' : 'Ancien mot de passe incorrect');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(isAr ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(isAr ? 'كلمة المرور قصيرة جداً' : 'Mot de passe trop court');
      return;
    }

    resetPassword(customer.id, passwordData.newPassword);
    
    // Update local state to reflect new password if needed (though store handles it)
    const updated = { ...customer, password_hash: passwordData.newPassword };
    setCustomer(updated);

    toast.success(isAr ? 'تم تغيير كلمة المرور' : 'Mot de passe modifié');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      <header>
        <h1 className="font-serif text-4xl md:text-5xl text-emerald-950 mb-2">
          {isAr ? 'إعدادات الحساب' : 'Paramètres'}
        </h1>
        <p className="text-emerald-950/40 font-medium">
          {isAr ? 'إدارة بياناتك الشخصية وأمان حسابك' : 'Gérez vos informations et la sécurité de votre compte'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Profile Section */}
        <div className="md:col-span-2 space-y-8">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-10 rounded-[3rem] border border-emerald-950/5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-emerald-950/5">
              <UserCircle className="text-emerald-900/40" />
              <h2 className="font-serif text-2xl text-emerald-950">{isAr ? 'المعلومات الشخصية' : 'Informations personnelles'}</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                    {isAr ? 'الاسم' : 'Prénom'}
                  </Label>
                  <Input 
                    className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50 focus:bg-white transition-all shadow-none"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                    {isAr ? 'اللقب' : 'Nom'}
                  </Label>
                  <Input 
                    className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50 focus:bg-white transition-all shadow-none"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                  {isAr ? 'اسم المحل' : 'Nom du magasin'}
                </Label>
                <Input 
                  className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50 focus:bg-white transition-all shadow-none"
                  value={profileData.shop_name}
                  onChange={(e) => setProfileData({ ...profileData, shop_name: e.target.value })}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                    {isAr ? 'الولاية' : 'Wilaya'}
                  </Label>
                  <Select 
                    value={profileData.wilaya} 
                    onValueChange={(val) => setProfileData({ ...profileData, wilaya: val })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50 focus:bg-white transition-all shadow-none">
                      <SelectValue placeholder={isAr ? 'اختر الولاية' : 'Sélectionner'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-emerald-950/5 shadow-2xl">
                      {wilayas.map((w) => (
                        <SelectItem key={w.id} value={w.name} className="py-3 rounded-xl">
                          {w.id} - {isAr ? w.nameAR : w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                    {isAr ? 'البلدية' : 'Commune'}
                  </Label>
                  <Input 
                    className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50 focus:bg-white transition-all shadow-none"
                    value={profileData.commune}
                    onChange={(e) => setProfileData({ ...profileData, commune: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full h-14 rounded-2xl bg-[#0a3d2e] hover:bg-emerald-900 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-emerald-900/20" disabled={isLoading}>
                  <Save size={16} />
                  {isAr ? 'حفظ التغييرات' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </motion.section>

          {/* Password Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 md:p-10 rounded-[3rem] border border-emerald-950/5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-emerald-950/5">
              <ShieldCheck className="text-amber-500/40" />
              <h2 className="font-serif text-2xl text-emerald-950">{isAr ? 'تغيير كلمة المرور' : 'Sécurité du compte'}</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                  {isAr ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 rtl:left-auto rtl:right-4" size={16} />
                  <Input 
                    type="password"
                    className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50 pl-12 rtl:pl-4 rtl:pr-12"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                    {isAr ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                  </Label>
                  <Input 
                    type="password"
                    className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 px-1">
                    {isAr ? 'تأكيد كلمة المرور' : 'Confirmation'}
                  </Label>
                  <Input 
                    type="password"
                    className="h-14 rounded-2xl border-emerald-950/5 bg-neutral-50/50"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="outline" className="w-full h-14 rounded-2xl border-emerald-950/10 text-emerald-950 hover:bg-neutral-50 font-black uppercase tracking-widest text-[10px]">
                  {isAr ? 'تحديث كلمة المرور' : 'Mettre à jour le mot de passe'}
                </Button>
              </div>
            </form>
          </motion.section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-[#0a3d2e] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-950/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Support Pro</h3>
              <p className="text-sm leading-relaxed mb-6 opacity-80">
                {isAr 
                  ? 'هل تحتاج إلى تغيير رقم هاتفك أو معلومات ضريبية؟ تواصل مع مدير حسابك.' 
                  : 'Besoin de modifier votre numéro ou vos infos fiscales ? Contactez votre gestionnaire de compte.'}
              </p>
              <Button className="w-full bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase tracking-widest py-6">
                WhatsApp Support
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
