'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"

interface ShiftFormProps {
  onSubmit?: (shiftData: {
    date: string
    type: 'day' | 'night'
    start_time: string
    end_time: string
    is_overtime?: boolean
  }) => void
  loading?: boolean
  onSubmitSuccess?: () => void
}

type SelectionMode = 'multiple' | 'range'

export default function ShiftForm({ onSubmit, loading = false, onSubmitSuccess }: ShiftFormProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('multiple')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [type, setType] = useState<'day' | 'night'>('day')
  const [startTime, setStartTime] = useState('07:30')
  const [endTime, setEndTime] = useState('19:30')
  const [isOvertime, setIsOvertime] = useState(false)

  // Reset all form state to initial values
  const resetForm = () => {
    setSelectedDates([])
    setDateRange(undefined)
    setType('day')
    setStartTime('07:30')
    setEndTime('19:30')
    setIsOvertime(false)
    setSelectionMode('multiple')
  }

  // Helper function to generate array of dates from range
  const generateDateRange = (from: Date, to: Date): Date[] => {
    const dates: Date[] = []
    const currentDate = new Date(from)
    
    while (currentDate <= to) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  // Get all dates for submission (either selectedDates or range-generated dates)
  const getAllSelectedDates = (): Date[] => {
    if (selectionMode === 'multiple') {
      return selectedDates
    } else if (selectionMode === 'range' && dateRange?.from && dateRange?.to) {
      return generateDateRange(dateRange.from, dateRange.to)
    } else if (selectionMode === 'range' && dateRange?.from) {
      return [dateRange.from]
    }
    return []
  }

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

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const allSelectedDates = getAllSelectedDates()
    
    // Enhanced validation
    if (allSelectedDates.length === 0) {
      alert('Please select at least one date using the calendar above')
      return
    }
    
    if (!startTime || !endTime) {
      alert('Please fill in both start and end times')
      return
    }
    
    if (!validateTimeFormat(startTime)) {
      alert('Please enter start time in HH:MM format (e.g., 07:30)')
      return
    }
    
    if (!validateTimeFormat(endTime)) {
      alert('Please enter end time in HH:MM format (e.g., 19:30)')
      return
    }
    
    // Submit each date as a separate shift
    if (onSubmit) {
      allSelectedDates.forEach(date => {
        onSubmit({
          date: date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
          type,
          start_time: startTime,
          end_time: endTime,
          is_overtime: isOvertime,
        })
      })
      // Reset form after successful submission
      resetForm()
      // Call optional success callback
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Add New Shift</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Dates ({getAllSelectedDates().length} selected)
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('multiple')
                  setDateRange(undefined)
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectionMode === 'multiple'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Multiple
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('range')
                  setSelectedDates([])
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectionMode === 'range'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Range
              </button>
            </div>
          </div>
          
          <div className="flex justify-center border border-gray-300 rounded-lg p-4">
            {selectionMode === 'multiple' ? (
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            ) : (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            )}
          </div>
          {getAllSelectedDates().length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-blue-900">
                  {selectionMode === 'range' ? 'Date range:' : 'Selected dates:'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectionMode === 'multiple') {
                      setSelectedDates([])
                    } else {
                      setDateRange(undefined)
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all
                </button>
              </div>
              
              {selectionMode === 'range' && dateRange?.from && (
                <div className="mb-2">
                  <span className="text-sm text-blue-800">
                    {dateRange.from.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric'
                    })}
                    {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() && (
                      <span>
                        {' → '}
                        {dateRange.to.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-blue-600 mt-1">
                    {getAllSelectedDates().length} days selected
                  </p>
                </div>
              )}
              
              {selectionMode === 'multiple' && (
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
              )}
            </div>
          )}
        </div>

        {/* Bulk Shift Form Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Shift Configuration</h3>
            {getAllSelectedDates().length > 0 && validateTimeFormat(startTime) && validateTimeFormat(endTime) && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ✓ Ready to create {getAllSelectedDates().length} {isOvertime ? 'overtime ' : ''}shift{getAllSelectedDates().length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {getAllSelectedDates().length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  📅 Please select dates from the calendar above to configure your shifts
                </p>
              </div>
            )}
            
            {/* Shift Type and Overtime Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shift Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shift Type
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('day')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      type === 'day'
                        ? 'bg-white text-yellow-700 shadow-sm border border-yellow-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ☀️ Day Shift
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('night')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      type === 'night'
                        ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🌙 Night Shift
                  </button>
                </div>
              </div>

              {/* Overtime Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overtime Status
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsOvertime(!isOvertime)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      isOvertime 
                        ? 'bg-orange-500' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isOvertime ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm">
                    <span className={`font-medium ${isOvertime ? 'text-orange-700' : 'text-gray-700'}`}>
                      {isOvertime ? '⚡ Overtime Shift' : 'Regular Shift'}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {isOvertime ? 'Extra pay eligible' : 'Standard rate'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Time Configuration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Time Configuration
                <span className="text-xs text-gray-500 ml-2">
                  (Pre-filled based on shift type, customizable)
                </span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-600 mb-2">
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
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-600 mb-2">
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

              {/* Time Preview */}
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shift Duration:</span>
                  <span className="font-mono text-gray-900">
                    {startTime} → {endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>Applied to {getAllSelectedDates().length} selected date{getAllSelectedDates().length !== 1 ? 's' : ''}</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type === 'day' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {type === 'day' ? '☀️ Day' : '🌙 Night'}
                    </span>
                    {isOvertime && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        ⚡ OT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || getAllSelectedDates().length === 0}
            className="w-full bg-blue-600 text-white py-4 px-6 text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading 
              ? 'Adding Shifts...' 
              : getAllSelectedDates().length === 0 
                ? 'Select dates to create shifts'
                : getAllSelectedDates().length === 1 
                  ? 'Add Shift' 
                  : `Add ${getAllSelectedDates().length} Shifts`
            }
          </button>
          
          {(getAllSelectedDates().length > 0 || type !== 'day' || startTime !== '07:30' || endTime !== '19:30' || isOvertime) && (
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔄 Reset Form
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 