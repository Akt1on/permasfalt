import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // This runs at module load time — throw clearly so Vercel logs show the issue
  throw new Error(
    "[supabase-admin] Missing required env vars: " +
      [!url && "SUPABASE_URL", !serviceKey && "SUPABASE_SERVICE_ROLE_KEY"]
        .filter(Boolean)
        .join(", "),
  );
}

/**
 * Server-only Supabase client with service role key.
 * Bypasses RLS — use ONLY in server-side API functions.
 * NEVER import this in client-side code.
 */
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
