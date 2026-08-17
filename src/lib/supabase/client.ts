import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";
import { supabaseFetch } from "@/lib/supabase/fetch";

export function createBrowserSupabaseClient() {
  const env = getPublicSupabaseEnv();
  if (!env) {
    throw new Error("Supabase public environment variables are not configured.");
  }
  return createBrowserClient(env.url, env.anonKey, {
    global: { fetch: supabaseFetch },
  });
}
