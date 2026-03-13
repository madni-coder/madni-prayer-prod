import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer server-side service role key for write/delete operations; fallback to anon for local read-only
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey =
    supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client if we have the variables, to avoid loud startup crashes if missing
export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing. Analytics/Events features will fail:", {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
}
