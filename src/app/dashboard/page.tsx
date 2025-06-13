'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '../../../components/AuthGuard'
import ShiftForm from '../../../components/ShiftForm'
import CalendarExportButton from '../../../components/CalendarExportButton'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Shift {
  id: string
  date: string
  type: 'day' | 'night'
  start_time: string
  end_time: string
  created_at: string
  is_overtime?: boolean
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

      console.log('Dashboard: fetching shifts for user ID:', user.id)

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      console.log('Dashboard: found', data?.length || 0, 'shifts')

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
    is_overtime?: boolean
  }) => {
    setSubmitting(true)
    setMessage('')

    console.log('=== ADDING SHIFT ===')
    console.log('Shift data:', shiftData)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('Adding shift for user:', user?.id)
      
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
            is_overtime: shiftData.is_overtime || false,
          }
        ])

      console.log('Insert result:', { data, error })

      if (error) {
        console.error('Error inserting shift:', error)
        setMessage('Error adding shift: ' + error.message)
      } else {
        setMessage('Shift added successfully!')
        console.log('SUCCESS: Shift added to database')
        // Refresh the shifts list
        console.log('Refreshing shifts list...')
        fetchShifts()
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
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
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Unexpected error deleting shift:', error)
      setMessage('An unexpected error occurred while deleting shift')
    } finally {
      setDeletingShiftId(null)
    }
  }

  const checkForDuplicateShifts = async (dates: string[]): Promise<string[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return []

      const { data, error } = await supabase
        .from('shifts')
        .select('date')
        .eq('user_id', user.id)
        .in('date', dates)

      if (error) {
        console.error('Error checking for duplicate shifts:', error)
        return []
      }

      return data?.map(shift => shift.date) || []
    } catch (error) {
      console.error('Unexpected error checking duplicates:', error)
      return []
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  SHIFT
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage your work schedule
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transform transition-all duration-200 hover:shadow-md"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Shift Form */}
              <div className="lg:col-span-2">
                <ShiftForm 
                  onSubmit={handleShiftSubmit} 
                  loading={submitting} 
                  onCheckDuplicates={checkForDuplicateShifts}
                />
              </div>

              {/* Calendar Export */}
              <div className="lg:col-span-1">
                <CalendarExportButton />
              </div>
            </div>

            {/* Shifts Display Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Shifts</h2>
              </div>
              <div className="p-6">
            
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
                                <div className="space-y-4">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className={`p-4 rounded-lg border-l-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-shadow ${
                      shift.type === 'day'
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-blue-600 bg-blue-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <span className="font-semibold text-gray-900 text-lg">
                          {(() => {
                            // Parse date string as local date to avoid timezone conversion
                            const [year, month, day] = shift.date.split('-').map(Number)
                            const localDate = new Date(year, month - 1, day) // month is 0-indexed
                            return localDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          })()}
                        </span>
                        <div className="flex gap-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium w-fit ${
                              shift.type === 'day'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {shift.type === 'day' ? '☀️ Day Shift' : '🌙 Night Shift'}
                          </span>
                          {shift.is_overtime && (
                            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-orange-200 text-orange-800 w-fit">
                              ⚡ Overtime
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-700 font-mono text-lg">
                        {shift.start_time} → {shift.end_time}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      disabled={deletingShiftId === shift.id}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors w-full sm:w-auto"
                    >
                      {deletingShiftId === shift.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                ))}
              </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 