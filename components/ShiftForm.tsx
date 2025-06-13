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

  const handleTypeChange = (newType: 'day' | 'night') => {
    console.log('Shift type changed to:', newType) // Debug log
    setType(newType)
    
    // Auto-fill times based on shift type
    if (newType === 'day') {
      console.log('Setting day shift times: 07:00 - 19:00') // Debug log
      setStartTime('07:00')
      setEndTime('19:00')
    } else if (newType === 'night') {
      console.log('Setting night shift times: 19:00 - 07:00') // Debug log
      setStartTime('19:00')
      setEndTime('07:00')
    }
  }

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
            className="w-full px-4 py-3 text-lg font-semibold text-gray-900 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-base font-semibold text-gray-900 mb-2">
            Shift Type: {type}
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              console.log('Select change event triggered:', e.target.value)
              handleTypeChange(e.target.value as 'day' | 'night')
            }}
            className="w-full px-4 py-3 text-lg font-semibold text-gray-900 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="day">Day Shift (07:00 - 19:00)</option>
            <option value="night">Night Shift (19:00 - 07:00)</option>
          </select>
        </div>

        <div>
          <label htmlFor="startTime" className="block text-base font-semibold text-gray-900 mb-2">
            Start Time: {startTime || 'Not set'}
          </label>
          <input
            type="text"
            id="startTime"
            value={startTime}
            onChange={(e) => {
              console.log('Start time changed to:', e.target.value)
              setStartTime(e.target.value)
            }}
            placeholder="HH:MM (e.g., 07:00)"
            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            maxLength={5}
            required
            className="w-full px-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-center"
            style={{ color: '#111827 !important' }}
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-base font-semibold text-gray-900 mb-2">
            End Time: {endTime || 'Not set'}
          </label>
          <input
            type="text"
            id="endTime"
            value={endTime}
            onChange={(e) => {
              console.log('End time changed to:', e.target.value)
              setEndTime(e.target.value)
            }}
            placeholder="HH:MM (e.g., 19:00)"
            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            maxLength={5}
            required
            className="w-full px-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-center"
            style={{ color: '#111827 !important' }}
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