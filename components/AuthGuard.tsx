'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/auth/login')
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          router.push('/auth/login')
        } else if (session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, don't render children (redirect will happen)
  if (!user) {
    return null
  }

  // User is authenticated, render children
  return <>{children}</>
} 