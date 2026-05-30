// Auto-generated — do not edit directly. Managed via Supabase integration.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseClient() {
  const SUPABASE_URL =
    (import.meta.env?.VITE_SUPABASE_URL as string | undefined) ||
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);

  const SUPABASE_KEY =
    (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (typeof process !== "undefined" ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["VITE_SUPABASE_URL"] : []),
      ...(!SUPABASE_KEY ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    // Log the error but don't crash — components will handle empty data gracefully
    console.error(
      `[Supabase] Missing env var(s): ${missing.join(", ")}. Data will be unavailable.`,
    );
    // Return a client with placeholder values — queries will fail gracefully
    // rather than crashing the entire React tree
    return createClient<Database>("https://placeholder.supabase.co", "placeholder", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      // Only use localStorage in browser context (not SSR)
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Singleton — created lazily on first access
let _client: ReturnType<typeof createSupabaseClient> | undefined;

function getClient() {
  if (!_client) _client = createSupabaseClient();
  return _client;
}

/**
 * Usage:
 *   import { supabase } from "@/integrations/supabase/client";
 *   const { data } = await supabase.from("services").select("*");
 */
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
