import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingEnvVars = [
    !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter(Boolean)

export const supabaseInitialization = {
    isConfigured: missingEnvVars.length === 0,
    missingEnvVars,
}

let supabaseClient = null

if (supabaseInitialization.isConfigured) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export function getSupabaseClient() {
    return supabaseClient
}

export const supabase = getSupabaseClient()
