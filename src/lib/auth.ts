// lib/auth.ts
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set in environment variables')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is not set in environment variables')
}



export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_EMAIL

export async function signInWithMagicLink() {
  if (!ALLOWED_EMAIL) {
    throw new Error('No allowed email configured')
  }
  
  return await supabase.auth.signInWithOtp({
    email: ALLOWED_EMAIL,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

// Add this new function to verify the Supabase client is initialized
export function verifySupabaseInit() {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
  return true
}