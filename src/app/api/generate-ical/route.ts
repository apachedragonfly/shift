import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Create a dummy ICS file content
    const dummyICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SHIFT Organizer//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:dummy-shift-1@shift-organizer.com
DTSTART:20250101T070000Z
DTEND:20250101T190000Z
SUMMARY:Day Shift
DESCRIPTION:Generated from SHIFT Organizer
LOCATION:Work
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
BEGIN:VEVENT
UID:dummy-shift-2@shift-organizer.com
DTSTART:20250102T190000Z
DTEND:20250103T070000Z
SUMMARY:Night Shift
DESCRIPTION:Generated from SHIFT Organizer
LOCATION:Work
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`

    // Return the ICS file as a response
    return new NextResponse(dummyICS, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="shifts.ics"',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error generating iCal:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    )
  }
} 