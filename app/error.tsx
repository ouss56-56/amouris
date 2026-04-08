'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error Caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full border border-red-100">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur s'est produite</h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs text-gray-800 mb-6 border border-gray-200">
          {error.stack}
        </pre>
        <button
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          onClick={() => reset()}
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
