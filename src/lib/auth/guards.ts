import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/academy/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole } from "@/lib/academy/types";
import { hasAnyCapability, primaryPortalRole, type Capability } from "@/lib/admin/rbac";

export async function requireUser() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");
  return userId;
}

export async function loadSessionRoles(userId: string): Promise<AppRole[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((row) => row.role as AppRole);
}

export async function requireRole(role: AppRole) {
  const userId = await requireUser();
  const roles = await loadSessionRoles(userId);
  if (!roles.includes(role) && !roles.includes("admin")) {
    redirect("/academy");
  }
  return { userId, roles };
}

export async function requirePortalAccess() {
  const userId = await requireUser();
  const roles = await loadSessionRoles(userId);
  if (!primaryPortalRole(roles)) {
    redirect("/academy");
  }
  return { userId, roles };
}

export async function requireCapability(needed: Capability | readonly Capability[]) {
  const session = await requirePortalAccess();
  if (!hasAnyCapability(session.roles, needed)) {
    redirect("/admin");
  }
  return session;
}
