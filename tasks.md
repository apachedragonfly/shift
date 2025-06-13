🛠️ MVP Build Plan: SHIFT

🔧 INIT & PROJECT SETUP

1. Create Next.js App with App Router
Start: Run npx create-next-app@latest shift --app
End: Project builds and runs with npm run dev

2. Set up Tailwind CSS
Start: Install Tailwind via official guide
End: A test class (text-red-500) shows correctly in app/page.tsx
3. Install and Configure Supabase Client
Start: Install @supabase/supabase-js
End: lib/supabase.ts exports working browser client
🔐 AUTHENTICATION

4. Set Up Supabase Project and Create .env.local
Start: Create project on supabase.com
End: .env.local includes working NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
5. Implement Supabase Email Auth (Sign Up)
Start: Create app/auth/signup/page.tsx with email, password
End: User can sign up and account appears in Supabase dashboard
6. Implement Supabase Email Auth (Login)
Start: Create app/auth/login/page.tsx with login form
End: Valid login redirects to dashboard
7. Create AuthGuard Component
Start: Create wrapper HOC or client component
End: Blocks dashboard unless user is authenticated
8. Add Logout Button to Dashboard
Start: Add signOut() to supabase.auth
End: User is logged out and redirected to login page
📦 SHIFT DATA MANAGEMENT

9. Create shifts Table in Supabase
Start: Add fields id, user_id, date, type, start_time, end_time
End: Confirm table exists and row-level security is ON
10. Configure RLS: Restrict Access to Own Shifts
Start: Add user_id = auth.uid() policy
End: Only authenticated user can read/write their own rows
11. Build ShiftForm.tsx (Single Shift)
Start: Create form with date, type, start_time, end_time
End: Local state correctly stores form inputs
12. Submit New Shift to Supabase
Start: Connect form to Supabase insert
End: Submitting form adds row to database
13. Auto-Fill Time Based on Shift Type
Start: Add logic to auto-fill times when type is “day” or “night”
End: Selecting “day” = 07:00–19:00; “night” = 19:00–07:00
14. Display All Shifts on Dashboard
Start: Use useEffect or SWR to fetch from Supabase
End: Shifts show up sorted by date
15. Add Delete Button for Each Shift
Start: Add button next to each entry
End: Clicking deletes shift from Supabase and UI
📤 ICALENDAR EXPORT

16. Add /api/generate-ical/route.ts Endpoint
Start: Create route file in app/api/generate-ical/route.ts
End: Returns 200 OK with dummy ICS file
17. Fetch User Shifts in API Route
Start: Load user session and query their shifts from Supabase
End: JSON of shifts returned server-side
18. Generate .ics Content from Shifts
Start: Use ics or ical-generator package
End: .ics blob includes correct shift events
19. Create CalendarExportButton.tsx
Start: Add a button that calls /api/generate-ical
End: Clicking downloads the .ics file
🧪 FINAL POLISH

20. Add Loading + Error States for Shift Actions
Start: Add spinners/messages for add/delete
End: All user interactions are responsive and fail gracefully
21. Protect Routes with Middleware
Start: Use middleware.ts to redirect unauthenticated users
End: Direct /dashboard access redirects to /auth/login if logged out
22. Clean Up Styling & Basic Responsive Layout
Start: Style dashboard and auth pages with Tailwind
End: Looks clean on mobile and desktop


23. Replace Date Input with ShadCN Calendar
Start: Install @radix-ui/react-calendar and related ShadCN dependencies if not already installed.
End: Single-date input in ShiftForm.tsx is replaced with a visually large calendar UI.
24. Refactor Calendar to Support Multiple Date Selection
Start: Modify calendar component state to track an array of selected dates (e.g. selectedDates: Date[])
End: Clicking on multiple days highlights/selects them all and stores the dates in state.
25. Add Toggle or Modifier for Range vs. Multiple Mode
Start: Add UI toggle (e.g. button group or switch) to choose between:
Range mode (continuous days)
Manual multi-date selection
End: Selection behavior updates depending on mode.
26. Create New Bulk Shift Form Section
Start: Below the calendar, add form inputs:
Shift Type (day/night dropdown or toggle)
Optional Start Time and End Time (pre-filled from shift type)
End: Inputs update state correctly and are validated
27. Auto-Fill Time Based on Shift Type
Start: When shift type is selected, populate start_time and end_time automatically (07:00–19:00 or 19:00–07:00)
End: Manual override is still allowed
28. Add Confirm Button to Trigger Bulk Insert
Start: Create Save Shifts button that triggers a bulk write to Supabase
End: Clicking adds all selected dates as separate rows
29. Display Toast or Modal Confirmation After Bulk Insert
Start: Show feedback using toast, dialog, or alert component
End: User knows how many shifts were added and what dates
30. Reset Calendar + Form After Submission
Start: On successful insert, clear selected dates and form state
End: Calendar and inputs are cleared, ready for next batch
31. Prevent Duplicate Shift Entries on Same Date
Start: Before insert, check Supabase for existing shifts on selected dates
End: Skip or notify on duplicate dates — user can choose to continue or cancel
32. Update Dashboard to Highlight Dates with Shifts
Start: Pull all user shift dates and pass to calendar component as "highlighted" or "marked"
End: Dates with shifts appear styled (e.g. dot under date or background color)
33. Add Filter to View Shifts by Month in Dashboard
Start: Above or beside calendar, add dropdown or month selector
End: List below calendar only shows shifts for selected month
34. Finalize Responsive Layout for Calendar View
Start: Ensure calendar and controls stack well on mobile
End: All interactions work smoothly on iOS Safari and smaller screen