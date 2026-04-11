'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'
import { useAdminAuth } from '@/store/admin-auth.store'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const login = useAdminAuth((state) => state.login)

  // Detect error from middleware redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlError = searchParams.get('error');
    if (urlError === 'unauthorized') {
      setError('Accès non autorisé : Vous n\'avez pas les droits d\'administrateur.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { ok, error: loginError } = await login(email, password)
      
      if (!ok) {
        throw new Error(loginError || 'Identifiants invalides')
      }

      router.replace('/admin')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a2e1f 0%, #0d1f15 50%, #050f0a 100%)' }}
    >
      {/* Cercles décoratifs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-emerald-500/10" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-amber-400/10" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <Lock size={24} className="text-emerald-400" />
            </div>
            <h1 className="text-white font-serif text-2xl mb-1">
              Amouris <span className="text-amber-400">Admin</span>
            </h1>
            <p className="text-white/40 text-sm tracking-widest uppercase">
              Portail sécurisé
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Email administrateur
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="admin@amouris-parfums.com"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 pr-11 rounded-lg focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm uppercase tracking-wider mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Accéder au panneau admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-white/20 hover:text-white/40 text-xs transition-colors">
              ← Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
