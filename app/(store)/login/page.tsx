"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login as supabaseLogin, getCurrentUser } from '@/lib/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { setUser, setAdmin } = useAuthStore();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Supabase Login
      await supabaseLogin(phone, password);
      
      // 2. Fetch User & Profile
      const data = await getCurrentUser();
      
      if (data && data.profile) {
        const profile = data.profile;
        const isAdmin = profile.role === 'admin' || profile.role === 'owner';
        
        setUser({
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          shopName: profile.shop_name,
          phoneNumber: profile.phone,
          wilaya: profile.wilaya,
          commune: profile.commune,
          status: profile.is_frozen ? 'frozen' : 'active',
          joinedAt: profile.created_at,
        });
        
        setAdmin(isAdmin);
        
        toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Connexion réussie');
        
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(language === 'ar' ? 'رقم الهاتف أو كلمة المرور غير صحيحة' : 'Téléphone ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <div className="w-full max-w-md bg-card border rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-heading font-bold mb-6 text-center">
          {t('common.login')}
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('checkout.phone')}</Label>
            <Input 
              id="phone" 
              type="text" 
              dir="ltr"
              placeholder="0555xxxxxx"
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</Label>
            <Input 
              id="password" 
              type="password" 
              dir="ltr"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('common.login')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {language === 'ar' ? 'ليس لديك حساب؟' : 'Vous n\'avez pas de compte ?'}
          <Link href="/register" className="text-primary font-medium hover:underline mx-2">
            {language === 'ar' ? 'سجل الآن' : 'Inscrivez-vous'}
          </Link>
        </div>
      </div>
    </div>
  );
}

