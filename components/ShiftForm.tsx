'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"

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
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [type, setType] = useState<'day' | 'night'>('day')
  const [startTime, setStartTime] = useState('07:30')
  const [endTime, setEndTime] = useState('19:30')

  const handleTypeChange = (newType: 'day' | 'night') => {
    console.log('Shift type changed to:', newType) // Debug log
    setType(newType)
    
    // Auto-fill times based on shift type
    if (newType === 'day') {
      console.log('Setting day shift times: 07:30 - 19:30') // Debug log
      setStartTime('07:30')
      setEndTime('19:30')
    } else if (newType === 'night') {
      console.log('Setting night shift times: 19:30 - 07:30') // Debug log
      setStartTime('19:30')
      setEndTime('07:30')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (selectedDates.length === 0 || !startTime || !endTime) {
      alert('Please select at least one date and fill in all time fields')
      return
    }
    
    // Submit each date as a separate shift
    if (onSubmit) {
      selectedDates.forEach(date => {
        onSubmit({
          date: date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
          type,
          start_time: startTime,
          end_time: endTime,
        })
      })
      // Clear selected dates after successful submission
      setSelectedDates([])
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Add New Shift</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Dates ({selectedDates.length} selected)
          </label>
          <div className="flex justify-center border border-gray-300 rounded-lg p-4">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              disabled={(date) => date < new Date()}
              className="rounded-md"
            />
          </div>
          {selectedDates.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-blue-900">Selected dates:</p>
                <button
                  type="button"
                  onClick={() => setSelectedDates([])}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                  >
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                    <button
                      type="button"
                      onClick={() => setSelectedDates(selectedDates.filter((_, i) => i !== index))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Shift Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              console.log('Select change event triggered:', e.target.value)
              handleTypeChange(e.target.value as 'day' | 'night')
            }}
            className="w-full px-3 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="day">☀️ Day Shift (07:30 - 19:30)</option>
            <option value="night">🌙 Night Shift (19:30 - 07:30)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="text"
              id="startTime"
              value={startTime}
              onChange={(e) => {
                console.log('Start time changed to:', e.target.value)
                setStartTime(e.target.value)
              }}
              placeholder="HH:MM (e.g., 07:30)"
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
              maxLength={5}
              required
              className="w-full px-3 py-3 text-lg font-mono text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-center"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="text"
              id="endTime"
              value={endTime}
              onChange={(e) => {
                console.log('End time changed to:', e.target.value)
                setEndTime(e.target.value)
              }}
              placeholder="HH:MM (e.g., 19:30)"
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
              maxLength={5}
              required
              className="w-full px-3 py-3 text-lg font-mono text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-center"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || selectedDates.length === 0}
          className="w-full bg-blue-600 text-white py-4 px-6 text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading 
            ? 'Adding Shifts...' 
            : selectedDates.length === 0 
              ? 'Select dates to create shifts'
              : selectedDates.length === 1 
                ? 'Add Shift' 
                : `Add ${selectedDates.length} Shifts`
          }
        </button>
      </form>
    </div>
  )
} 