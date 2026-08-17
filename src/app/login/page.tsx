import { LoginForm } from "@/components/auth/LoginForm";
import { isSupabaseConfigured, missingSupabaseConfigMessage } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <LoginForm
      unconfigured={!isSupabaseConfigured()}
      unconfiguredMessage={missingSupabaseConfigMessage()}
    />
  );
}
