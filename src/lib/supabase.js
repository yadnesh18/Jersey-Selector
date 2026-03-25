// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Creates and exports ONE Supabase client instance.
// Import this wherever you need to talk to the database.
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

// These come from your .env file (Vite exposes VITE_ prefixed vars)
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

// Guard: crash early with a clear message if keys are missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '⚠️  Supabase environment variables are missing!\n' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
