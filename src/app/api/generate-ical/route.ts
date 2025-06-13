import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for server-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

    // Set the auth token for this request
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Fetch user's shifts from database
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (shiftsError) {
      console.error('Error fetching shifts:', shiftsError)
      return NextResponse.json(
        { error: 'Failed to fetch shifts' },
        { status: 500 }
      )
    }

    // For now, return shifts as JSON (will convert to ICS in next task)
    return NextResponse.json({
      message: 'Shifts fetched successfully',
      userId: user.id,
      userEmail: user.email,
      shiftsCount: shifts?.length || 0,
      shifts: shifts || []
    })

  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 