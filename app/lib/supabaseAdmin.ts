import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key.
// This bypasses Row Level Security — NEVER import this in client components.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
