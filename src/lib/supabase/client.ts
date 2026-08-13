import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const env = getPublicSupabaseEnv();
  if (!env) {
    throw new Error("Supabase public environment variables are not configured.");
  }
  return createBrowserClient(env.url, env.anonKey);
}
