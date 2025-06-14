import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createEvents } from 'ics'

interface Shift {
  id: string
  date: string
  type: 'day' | 'night' | '8hour'
  start_time: string
  end_time: string
  user_id: string
  created_at: string
  is_overtime?: boolean
}

// Helper function to convert shift data to ICS event format
function convertShiftToEvent(shift: Shift) {
  const { date, type, start_time, end_time, id } = shift
  
  // Parse date components directly to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number)
  const [startHour, startMinute] = start_time.split(':').map(Number)
  const [endHour, endMinute] = end_time.split(':').map(Number)
  
  // Create start date components
  const startYear = year
  const startMonth = month
  const startDay = day
  
  // Create end date components
  let endYear = year
  let endMonth = month
  let endDay = day
  
  // Handle night shift that goes to next day
  if (type === 'night' && endHour < startHour) {
    const nextDay = new Date(year, month - 1, day + 1)
    endYear = nextDay.getFullYear()
    endMonth = nextDay.getMonth() + 1
    endDay = nextDay.getDate()
  }
  
  return {
    start: [startYear, startMonth, startDay, startHour, startMinute] as [number, number, number, number, number],
    end: [endYear, endMonth, endDay, endHour, endMinute] as [number, number, number, number, number],
    startInputType: 'local' as const,
    endInputType: 'local' as const,
    title: `${type === 'day' ? 'Day' : type === '8hour' ? '8-Hour' : 'Night'} Shift`,
    description: `Generated from SHIFT Organizer`,
    location: 'Work',
    uid: `shift-${id}@shift-organizer.com`,
    status: 'CONFIRMED' as const,
    sequence: 0
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Extract the token
    const token = authHeader.substring(7)

    // Create a new Supabase client with the user's token for this request
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verify the user with the authenticated client
    const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Fetch user's shifts from database using the authenticated client
    console.log('Fetching shifts for user:', user.id)
    const { data: shifts, error: shiftsError } = await supabaseWithAuth
      .from('shifts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    console.log('Shifts query result:', { shifts, shiftsError, count: shifts?.length })

    if (shiftsError) {
      console.error('Error fetching shifts:', shiftsError)
      return NextResponse.json(
        { error: 'Failed to fetch shifts' },
        { status: 500 }
      )
    }

    // Convert shifts to ICS events
    if (!shifts || shifts.length === 0) {
      return NextResponse.json(
        { error: 'No shifts found to export' },
        { status: 404 }
      )
    }

    // Convert each shift to ICS event format
    const events = shifts.map(shift => convertShiftToEvent(shift))

    // Generate ICS content
    const { error: icsError, value: icsContent } = createEvents(events)

    if (icsError) {
      console.error('Error creating ICS content:', icsError)
      return NextResponse.json(
        { error: 'Failed to generate calendar file' },
        { status: 500 }
      )
    }

    // Return the ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="shifts.ics"',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 