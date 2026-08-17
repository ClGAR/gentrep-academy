import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/env";
import { supabaseFetch } from "@/lib/supabase/fetch";

export async function updateSession(request: NextRequest) {
  const env = getPublicSupabaseEnv();
  let response = NextResponse.next({ request });

  if (!env) {
    return response;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}
