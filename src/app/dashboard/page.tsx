'use client'

import { useState } from 'react'
import AuthGuard from '../../../components/AuthGuard'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-8 py-4 text-xl font-bold text-white rounded-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform transition-all duration-200"
              style={{ 
                backgroundColor: '#dc2626', 
                borderColor: '#dc2626',
                minWidth: '120px',
                minHeight: '60px'
              }}
            >
              {loading ? 'Logging out...' : 'LOGOUT'}
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Welcome to SHIFT! You have successfully logged in.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 