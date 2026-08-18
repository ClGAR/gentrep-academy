import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/academy/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole } from "@/lib/academy/types";

export async function requireUser() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");
  return userId;
}

export async function requireRole(role: AppRole) {
  const userId = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((row) => row.role);
  if (!roles.includes(role) && !roles.includes("admin")) {
    redirect("/academy");
  }
  return { userId, roles };
}
