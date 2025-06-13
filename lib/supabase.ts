import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables at runtime
function validateSupabaseConfig() {
  if (typeof window !== 'undefined') {
    // Client-side validation
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }
  }
}

// Create client with runtime validation
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
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