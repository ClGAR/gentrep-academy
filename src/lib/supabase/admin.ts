import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getServiceRoleKey } from "@/lib/env";

export function createAdminSupabaseClient() {
  const env = getPublicSupabaseEnv();
  const serviceRole = getServiceRoleKey();
  if (!env || !serviceRole) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  return createClient(env.url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
