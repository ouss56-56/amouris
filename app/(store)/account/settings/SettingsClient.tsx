"use client";

import { useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { wilayas } from '@/lib/wilayas';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';
import { updateProfile } from '@/lib/actions/customers';

interface SettingsClientProps {
  user: Customer;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const { t, language } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    shopName: user.shopName || '',
    wilaya: user.wilaya,
    commune: user.commune,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        shopName: formData.shopName,
        wilaya: formData.wilaya,
        commune: formData.commune,
      });
      toast.success(language === 'ar' ? 'تم تحديث الإعدادات بنجاح' : 'Paramètres mis à jour avec succès');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Échec de la mise à jour: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold">
          {language === 'ar' ? 'إعدادات الحساب' : 'Paramètres du compte'}
        </h1>
      </div>

      <div className="bg-card border rounded-xl p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('checkout.first_name')}</Label>
              <Input 
                id="firstName" 
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('checkout.last_name')}</Label>
              <Input 
                id="lastName" 
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopName">{language === 'ar' ? 'اسم المحل' : 'Nom du magasin'}</Label>
            <Input 
              id="shopName" 
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="wilaya">{t('checkout.wilaya')}</Label>
              <Select 
                value={formData.wilaya} 
                onValueChange={(val) => setFormData({ ...formData, wilaya: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wilayas.map((w) => (
                    <SelectItem key={w.id} value={w.name}>
                      {w.id} - {language === 'ar' ? w.nameAR : w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commune">{language === 'ar' ? 'البلدية' : 'Commune'}</Label>
              <Input 
                id="commune" 
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="h-12 px-8 text-lg gap-2" disabled={isLoading}>
              <Save className="w-5 h-5" />
              {isLoading ? t('common.loading') : (language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
