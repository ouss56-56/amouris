'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\.\+\(\)]/g, '').trim()
}

function phoneToEmail(phone: string): string {
  return `${normalizePhone(phone)}@amouris.app`
}

export async function registerAction(formData: {
  first_name: string
  last_name: string
  phone: string
  password: string
  shop_name?: string
  wilaya: string
  commune?: string
}) {
  const supabase = await createClient()
  const normalizedPhone = normalizePhone(formData.phone)
  const email = phoneToEmail(normalizedPhone)

  // Vérifier si le numéro existe déjà
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', normalizedPhone)
    .maybeSingle()

  if (existing) {
    return { error: 'Ce numéro de téléphone est déjà utilisé' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        shop_name: formData.shop_name ?? null,
        phone: normalizedPhone,
        wilaya: formData.wilaya,
        commune: formData.commune ?? null,
        role: 'customer',
      },
    },
  })

  if (error) {
    console.error('Register error:', error)
    return { error: error.message }
  }

  redirect('/account')
}

export async function loginAction(phone: string, password: string) {
  const supabase = await createClient()
  const email = phoneToEmail(phone)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Numéro de téléphone ou mot de passe incorrect' }
  }

  // Vérifier si le compte est gelé
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_frozen, role')
    .eq('id', data.user.id)
    .single()

  if (profile?.is_frozen) {
    await supabase.auth.signOut()
    return { error: 'Ce compte a été suspendu. Contactez l\'administration.' }
  }

  redirect('/account')
}

export async function adminLoginAction(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Identifiants incorrects' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'Accès non autorisé. Ce compte n\'a pas les droits administrateur.' }
  }

  redirect('/admin')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

import { createAdminClient } from '@/lib/supabase/admin'

export async function adminRegisterCustomer(email: string, password: string, userData: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: userData,
    email_confirm: true,
  })
  
  if (error) {
    console.error('Admin create user error:', error)
    return { error: error.message }
  }
  
  return { user: data.user }
}
export async function updatePasswordAction(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  
  if (error) {
    console.error('Update password error:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
