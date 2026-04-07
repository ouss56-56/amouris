"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { wilayas } from '@/lib/wilayas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { registerCustomer } from '@/lib/actions/customers';

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    shopName: '',
    phone: '',
    wilaya: '',
    commune: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await registerCustomer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        shopName: formData.shopName,
        phone: formData.phone,
        password: formData.password,
        wilaya: formData.wilaya,
        commune: formData.commune,
      });

      toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول' : 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء الحساب' : 'Échec de la création du compte: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-2xl bg-card border rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-heading font-bold mb-2 text-center">
          {language === 'ar' ? 'إنشاء حساب جديد' : 'Créer un compte'}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {language === 'ar' 
            ? 'انضم إلينا كتاجر تجزئة للحصول على أفضل أسعار الجملة.' 
            : 'Rejoignez-nous en tant que détaillant pour obtenir les meilleurs prix de gros.'}
        </p>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('checkout.first_name')} *</Label>
              <Input 
                id="firstName" 
                required 
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('checkout.last_name')} *</Label>
              <Input 
                id="lastName" 
                required 
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopName">{language === 'ar' ? 'اسم المحل التجاري' : 'Nom du magasin'} *</Label>
            <Input 
              id="shopName" 
              required 
              value={formData.shopName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('checkout.phone')} *</Label>
            <Input 
              id="phone" 
              type="tel" 
              dir="ltr" 
              required 
              placeholder="05xxxxxx"
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'سيتم استخدامه لتسجيل الدخول.' : 'Sera utilisé pour vous connecter.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="wilaya">{t('checkout.wilaya')} *</Label>
              <Select 
                required 
                value={formData.wilaya} 
                onValueChange={(val) => setFormData({ ...formData, wilaya: val })}
              >
                <SelectTrigger className={language === 'ar' ? 'flex-row-reverse' : ''}>
                  <SelectValue placeholder={t('checkout.wilaya')} />
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
              <Label htmlFor="commune">{language === 'ar' ? 'البلدية' : 'Commune'} *</Label>
              <Input 
                id="commune" 
                required 
                value={formData.commune}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور' : 'Mot de passe'} *</Label>
              <Input 
                id="password" 
                type="password" 
                dir="ltr" 
                required 
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'} *</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                dir="ltr" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
             {isLoading ? t('common.loading') : (language === 'ar' ? 'إنشاء الحساب' : 'Créer le compte')}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-6">
          {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?'}
          <Link href="/login" className="text-primary font-medium hover:underline mx-2">
            {t('common.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}

