'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '../../../components/AuthGuard'
import ShiftForm from '../../../components/ShiftForm'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Shift {
  id: string
  date: string
  type: 'day' | 'night'
  start_time: string
  end_time: string
  created_at: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [fetchingShifts, setFetchingShifts] = useState(true)
  const [deletingShiftId, setDeletingShiftId] = useState<string | null>(null)
  const router = useRouter()

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    setFetchingShifts(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching shifts:', error)
      } else {
        setShifts(data || [])
      }
    } catch (error) {
      console.error('Unexpected error fetching shifts:', error)
    } finally {
      setFetchingShifts(false)
    }
  }

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
        // Refresh the shifts list
        fetchShifts()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    setDeletingShiftId(shiftId)
    
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId)

      if (error) {
        console.error('Error deleting shift:', error)
        setMessage('Error deleting shift: ' + error.message)
      } else {
        // Remove shift from local state immediately
        setShifts(shifts.filter(shift => shift.id !== shiftId))
        setMessage('Shift deleted successfully!')
      }
    } catch (error) {
      console.error('Unexpected error deleting shift:', error)
      setMessage('An unexpected error occurred while deleting shift')
    } finally {
      setDeletingShiftId(null)
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

          {/* Shifts Display Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Shifts</h2>
            
            {fetchingShifts ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading shifts...</p>
              </div>
            ) : shifts.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No shifts scheduled yet. Add your first shift above!
              </p>
            ) : (
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shift.type === 'day' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {shift.type === 'day' ? '☀️ Day' : '🌙 Night'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(shift.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {shift.start_time} - {shift.end_time}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      disabled={deletingShiftId === shift.id}
                      className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingShiftId === shift.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 