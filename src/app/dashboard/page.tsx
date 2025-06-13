'use client'

import { useState } from 'react'
import AuthGuard from '../../../components/AuthGuard'
import ShiftForm from '../../../components/ShiftForm'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
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

  const handleShiftSubmit = async (shiftData: {
    date: string
    type: 'day' | 'night'
    start_time: string
    end_time: string
  }) => {
    setSubmitting(true)
    setMessage('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('You must be logged in to add shifts')
        return
      }

      // Insert shift into database
      const { data, error } = await supabase
        .from('shifts')
        .insert([
          {
            user_id: user.id,
            date: shiftData.date,
            type: shiftData.type,
            start_time: shiftData.start_time,
            end_time: shiftData.end_time,
          }
        ])

      if (error) {
        console.error('Error inserting shift:', error)
        setMessage('Error adding shift: ' + error.message)
      } else {
        setMessage('Shift added successfully!')
        console.log('Shift added:', data)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage('An unexpected error occurred')
    } finally {
      setSubmitting(false)
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
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <p className="text-gray-600">
              Welcome to SHIFT! You have successfully logged in.
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <ShiftForm onSubmit={handleShiftSubmit} loading={submitting} />
        </div>
      </div>
    </AuthGuard>
  )
} 