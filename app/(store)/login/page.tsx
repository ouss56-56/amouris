'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/store/customer-auth.store'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useCustomerAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = await login(phone, password)
    if (result.ok) {
      router.replace('/account')
    } else {
      setError(result.error || 'Identifiants incorrects')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-emerald-900">Connexion</h1>
          <p className="text-gray-400 text-sm mt-1">Accédez à votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Numéro de téléphone</label>
            <input
              type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError('') }}
              placeholder="0550 00 00 00"
              autoComplete="tel"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Mot de passe</label>
            <input
              type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
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
            className="w-full bg-emerald-800 text-white py-3 rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-emerald-700 font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link href="/admin/login" className="text-xs text-gray-300 hover:text-gray-400 transition-colors">
            Accès administrateur →
          </Link>
        </div>
      </div>
    </div>
  )
}
