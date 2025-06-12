🗓️ SHIFT — Architecture & Structure

📁 File & Folder Structure (App Router)

/shift-organizer
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── [shiftId]/edit/page.tsx
│   │   └── new/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── api/
│       └── generate-ical/route.ts
├── components/
│   ├── ShiftForm.tsx
│   ├── ShiftList.tsx
│   ├── CalendarExportButton.tsx
│   └── AuthGuard.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── calendar.ts
│   └── utils.ts
├── types/
│   └── shift.ts
├── styles/
│   └── globals.css
├── middleware.ts
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
🧠 Project Purpose

Build a secure web app to quickly create shift entries, tag them as day/night, set times, and export in bulk to Apple Calendar via .ics format.
🔐 Authentication & Backend — Supabase

✅ What Supabase Handles:
User Auth (email/password)
Shift data storage (Postgres)
Row-level security
Realtime (optional)
🧾 Supabase Table: shifts
Column	Type	Notes
id	UUID	Primary Key
user_id	UUID	FK from auth.users
date	date	Shift date
type	text	day or night
start_time	time	e.g., 07:00:00
end_time	time	e.g., 19:00:00
created_at	timestamptz	Default: now()
Add RLS policy to ensure users can only read/write their own shifts.
🧩 Component Overview

ShiftForm.tsx
UI to create/edit shifts
Select day or night
Pick multiple dates at once
Auto-fill start/end based on shift type
ShiftList.tsx
Display all scheduled shifts
Sort by date
Option to delete/edit
CalendarExportButton.tsx
Calls API to generate .ics
Triggers download or opens in Calendar app
AuthGuard.tsx
Wraps any route that requires auth
Redirects unauthenticated users to /auth/login
📲 App Directory (/app) Breakdown

app/page.tsx
Homepage
Redirects to dashboard if logged in
app/dashboard/
Main user interface
Displays upcoming shifts
Allows adding/editing shifts
app/api/generate-ical/route.ts
Serverless API route
Pulls user’s shifts from Supabase
Generates .ics file dynamically
Returns it as a downloadable blob
🧬 State Management

Global:
Auth state from Supabase client (supabase.auth.getUser())
Local:
Form state via React useState or react-hook-form
Shift list fetched via useEffect or SWR
No Redux or Zustand needed — local/component state is sufficient.
🔗 Service Integration

Supabase
Connected via /lib/supabase.ts:
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
iCal Export
In /lib/calendar.ts, use ics or ical-generator to build calendar content:
import { createEvents } from 'ics'

export function generateICS(shifts) {
  return createEvents(shifts.map(shift => ({
    start: [...parseDateTime(shift.date, shift.start_time)],
    end: [...parseDateTime(shift.date, shift.end_time)],
    title: `${shift.type === 'day' ? 'Day' : 'Night'} Shift`,
    description: 'Generated from Shift Organizer',
  })))
}
🌍 Deployment

Hosting:
Vercel (ideal for Next.js)
Supabase is cloud-hosted already
Environment:
.env.local:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
🔄 Calendar Import Flow (End-to-End)

User logs in
Creates multiple shifts via UI
Clicks Export Calendar
Serverless route /api/generate-ical fetches shifts → generates .ics
User downloads .ics → opens in Calendar app
iOS/macOS Calendar imports shifts instantly
📌 Security Notes

RLS on Supabase ensures user data isolation
API route only returns data for authenticated user
Minimal data retained — just dates and shift times
💡 Nice-to-Have Features Later

CSV upload (bulk entry)
Repeating shifts (e.g., every 2nd weekend)
Apple Shortcuts integration for fast entry
Timezone-aware entries
Dark mode toggle