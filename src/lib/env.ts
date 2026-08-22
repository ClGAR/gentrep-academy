function readPublicEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getPublicSupabaseEnv() {
  const url = readPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey =
    readPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    readPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getPublicSupabaseEnv() !== null;
}

export function getSiteUrl() {
  const configured = readPublicEnv(process.env.NEXT_PUBLIC_SITE_URL);
  const inferred = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const url = new URL(configured || inferred);
  return url.toString().replace(/\/$/, "");
}

export function getServiceRoleKey() {
  return (
    readPublicEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    readPublicEnv(process.env.SUPABASE_SECRET_KEY)
  );
}

export function missingSupabaseConfigMessage() {
  if (process.env.VERCEL) {
    return "This Academy link is not ready to sign in yet. Ask the person who sent it to reconnect Supabase on the hosted project, then open this same link again.";
  }
  return "Supabase credentials are not configured. Copy `.env.example` to `.env.local` and add project keys.";
}
