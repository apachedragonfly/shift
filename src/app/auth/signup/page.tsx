'use client'

import { useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'

// Force dynamic rendering to avoid prerender issues with Supabase
export const dynamic = 'force-dynamic'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else if (data?.user) {
        setMessage('Sign up successful! Check your email to confirm your account.')
      }
    } catch {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="text-3xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
            >
              SHIFT
            </button>
            <p className="text-gray-600">Create your account</p>
          </div>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password (min. 6 characters)"
                minLength={6}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg border ${
                message.includes('successful') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${
                  message.includes('successful') ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="font-medium text-blue-600 hover:text-blue-500 underline"
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 