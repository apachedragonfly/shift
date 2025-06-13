'use client'

import { useState } from 'react'

interface ShiftFormProps {
  onSubmit?: (shiftData: {
    date: string
    type: 'day' | 'night'
    start_time: string
    end_time: string
  }) => void
  loading?: boolean
}

export default function ShiftForm({ onSubmit, loading = false }: ShiftFormProps) {
  const [date, setDate] = useState('')
  const [type, setType] = useState<'day' | 'night'>('day')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('19:00')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSubmit) {
      onSubmit({
        date,
        type,
        start_time: startTime,
        end_time: endTime,
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Shift</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-base font-semibold text-gray-900 mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-base font-semibold text-gray-900 mb-2">
            Shift Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'day' | 'night')}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="day">Day Shift (07:00 - 19:00)</option>
            <option value="night">Night Shift (19:00 - 07:00)</option>
          </select>
        </div>

        <div>
          <label htmlFor="startTime" className="block text-base font-semibold text-gray-900 mb-2">
            Start Time (24-hour format)
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            step="300"
            pattern="[0-9]{2}:[0-9]{2}"
            title="Please enter time in 24-hour format (HH:MM)"
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
            style={{ colorScheme: 'light' }}
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-base font-semibold text-gray-900 mb-2">
            End Time (24-hour format)
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            step="300"
            pattern="[0-9]{2}:[0-9]{2}"
            title="Please enter time in 24-hour format (HH:MM)"
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
            style={{ colorScheme: 'light' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-6 text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Adding Shift...' : 'Add Shift'}
        </button>
      </form>
    </div>
  )
} 