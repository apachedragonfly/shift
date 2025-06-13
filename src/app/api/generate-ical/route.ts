import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createEvents } from 'ics'

// Create Supabase client for server-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper function to convert shift data to ICS event format
function convertShiftToEvent(shift: any) {
  const { date, type, start_time, end_time, id } = shift
  
  // Parse date and times
  const shiftDate = new Date(date)
  const [startHour, startMinute] = start_time.split(':').map(Number)
  const [endHour, endMinute] = end_time.split(':').map(Number)
  
  // Create start datetime
  const startDateTime = new Date(shiftDate)
  startDateTime.setHours(startHour, startMinute, 0, 0)
  
  // Create end datetime
  const endDateTime = new Date(shiftDate)
  endDateTime.setHours(endHour, endMinute, 0, 0)
  
  // Handle night shift that goes to next day
  if (type === 'night' && endHour < startHour) {
    endDateTime.setDate(endDateTime.getDate() + 1)
  }
  
  return {
    start: [
      startDateTime.getFullYear(),
      startDateTime.getMonth() + 1, // Month is 0-indexed
      startDateTime.getDate(),
      startDateTime.getHours(),
      startDateTime.getMinutes()
    ] as [number, number, number, number, number],
    end: [
      endDateTime.getFullYear(),
      endDateTime.getMonth() + 1,
      endDateTime.getDate(),
      endDateTime.getHours(),
      endDateTime.getMinutes()
    ] as [number, number, number, number, number],
    title: `${type === 'day' ? 'Day' : 'Night'} Shift`,
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
    const events = shifts.map(convertShiftToEvent)

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