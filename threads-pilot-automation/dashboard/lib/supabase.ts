import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey)
    return supabaseInstance
  }

  return null
}

export function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return isValidUrl(url) && !!key
}
