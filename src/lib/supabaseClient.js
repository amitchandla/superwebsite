import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail loud in dev instead of silently creating a broken client.
// This is the #1 cause of "login button does nothing" bugs.
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    '[BizGrow AI] Supabase is not configured. Set VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY in your .env file (see .env.example). ' +
    'Authentication will not work until this is fixed.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
