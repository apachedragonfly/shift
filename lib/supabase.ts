import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isValidUrl(value: string | undefined): boolean {
	if (!value) return false
	try {
		new URL(value)
		return true
	} catch {
		return false
	}
}

// Validate environment variables at runtime
function validateSupabaseConfig() {
	if (typeof window !== 'undefined') {
		// Client-side validation
		if (!supabaseUrl || !supabaseAnonKey) {
			throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.')
		}
		if (!isValidUrl(supabaseUrl)) {
			throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. It must be the full API URL like https://<project-ref>.supabase.co (Project Settings → API).')
		}
	}
}

// Compute safe values to avoid crashing the bundle on invalid input
const effectiveUrl = isValidUrl(supabaseUrl || '') ? (supabaseUrl as string) : 'https://placeholder.supabase.co'
const effectiveAnonKey = supabaseAnonKey && supabaseAnonKey.trim().length > 0 ? supabaseAnonKey : 'placeholder-key'

// Create client with runtime validation
export const supabase = createClient(
	effectiveUrl,
	effectiveAnonKey,
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
		}
	}
)

// Validate config when accessed
const originalAuth = supabase.auth
supabase.auth = new Proxy(originalAuth, {
	get(target, prop) {
		validateSupabaseConfig()
		return target[prop as keyof typeof target]
	}
}) 