import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv } from "@/lib/env";
import { supabaseFetch } from "@/lib/supabase/fetch";

export async function createServerSupabaseClient() {
  const env = getPublicSupabaseEnv();
  if (!env) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; proxy.ts writes the cookies.
        }
      },
    },
  });
}
