'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CalendarExportButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setMessage('You must be logged in to export calendar')
        return
      }

      console.log('Export: attempting for user ID:', session.user.id)

      // Call the API endpoint with auth token
      const response = await fetch('/api/generate-ical', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Export: API status', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('Export: API error -', errorData.error)
        setMessage(errorData.error || 'Failed to generate calendar file')
        return
      }

      // Get the filename from the response headers or use default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'shifts.ics'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Convert response to blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary download link
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setMessage('Calendar exported successfully!')

    } catch (error) {
      console.error('Error exporting calendar:', error)
      setMessage('An unexpected error occurred while exporting calendar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Export to Calendar</h2>
      
      <p className="text-gray-600 mb-4">
        Download your shifts as a calendar file (.ics) to import into Apple Calendar, Google Calendar, or other calendar apps.
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-6 text-lg font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting Calendar...
          </span>
        ) : (
          '📅 Export to Calendar'
        )}
      </button>
    </div>
  )
} 