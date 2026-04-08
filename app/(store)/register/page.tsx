'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/store/customer-auth.store'
import Link from 'next/link'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj',
  'Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
  'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal',
  'Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El MGhair','El Meniaa'
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useCustomerAuth()

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', shopName: '',
    wilaya: '', commune: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.firstName.trim()) return setError('Le prénom est requis')
    if (!form.lastName.trim()) return setError('Le nom est requis')
    if (!form.phone.trim()) return setError('Le numéro de téléphone est requis')
    if (!form.wilaya) return setError('Veuillez sélectionner votre wilaya')
    if (form.password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères')
    if (form.password !== form.confirmPassword) return setError('Les mots de passe ne correspondent pas')

    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    const result = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      shopName: form.shopName.trim() || undefined,
      wilaya: form.wilaya,
      commune: form.commune.trim() || undefined,
      password: form.password,
    })

    if (result.ok) {
      router.replace('/account')
    } else {
      setError(result.error || 'Échec de la création du compte')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-emerald-900">
            Créer un compte
          </h1>
          <p className="text-gray-400 text-sm mt-1">Rejoignez Amouris Parfums</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Prénom *</label>
              <input
                type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                placeholder="Mohammed"
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Nom *</label>
              <input
                type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                placeholder="Benali"
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Téléphone *</label>
            <input
              type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
              placeholder="0550 00 00 00"
              autoComplete="tel"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Nom du magasin <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text" value={form.shopName} onChange={e => update('shopName', e.target.value)}
              placeholder="Parfumerie El Nour"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Wilaya *</label>
              <select
                value={form.wilaya} onChange={e => update('wilaya', e.target.value)}
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400 bg-white"
              >
                <option value="">Sélectionner...</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Commune <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text" value={form.commune} onChange={e => update('commune', e.target.value)}
                placeholder="Votre commune"
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Mot de passe *</label>
            <input
              type="password" value={form.password} onChange={e => update('password', e.target.value)}
              placeholder="Minimum 6 caractères"
              autoComplete="new-password"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Confirmer le mot de passe *</label>
            <input
              type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-emerald-800 text-white py-3 rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-emerald-700 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
