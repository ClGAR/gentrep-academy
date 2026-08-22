import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/academy/queries";
import { homePath } from "@/lib/admin/rbac";
import { loadSessionRoles } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");
  const roles = await loadSessionRoles(userId);
  redirect(homePath(roles));
}
