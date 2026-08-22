"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { toPublicErrorMessage } from "@/lib/supabase/jwt";
import {
  accountStatusSchema,
  assignClinicianSchema,
  assignRoleSchema,
  cmsActionSchema,
  cmsEntrySchema,
  staffNoteSchema,
  supportCaseSchema,
  supportCaseStatusSchema,
} from "@/lib/schemas/admin";

export type ActionResult<T = Record<string, unknown>> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function refreshPortal() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/content");
  revalidatePath("/admin/caseload");
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/audit");
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<ActionResult<T>> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }
  const supabase = await createServerSupabaseClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  if (authError || !claims) {
    return { ok: false, error: "Sign in to continue." };
  }
  const { data, error } = await supabase.rpc(name, args);
  if (error) {
    return { ok: false, error: toPublicErrorMessage(error.message) };
  }
  refreshPortal();
  return { ok: true, data: data as T };
}

export async function setAccountStatusAction(input: unknown): Promise<ActionResult> {
  const parsed = accountStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  return rpc("set_account_status", { p_user_id: parsed.data.userId, p_status: parsed.data.status });
}

export async function addStaffNoteAction(input: unknown): Promise<ActionResult> {
  const parsed = staffNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the note." };
  return rpc("add_staff_note", {
    p_subject_user_id: parsed.data.subjectUserId,
    p_kind: parsed.data.kind,
    p_body: parsed.data.body,
  });
}

export async function assignClinicianAction(input: unknown): Promise<ActionResult> {
  const parsed = assignClinicianSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the assignment." };
  return rpc("assign_clinician", {
    p_member_id: parsed.data.memberId,
    p_clinician_id: parsed.data.clinicianId,
  });
}

export async function toggleUserRoleAction(input: unknown): Promise<ActionResult> {
  const parsed = assignRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the role." };
  return rpc("toggle_user_role", {
    p_user_id: parsed.data.userId,
    p_role: parsed.data.role,
    p_enabled: parsed.data.enabled,
  });
}

export async function openSupportCaseAction(input: unknown): Promise<ActionResult> {
  const parsed = supportCaseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the ticket." };
  return rpc("open_support_case", {
    p_member_id: parsed.data.memberId,
    p_title: parsed.data.title,
    p_topic: parsed.data.topic,
    p_priority: parsed.data.priority,
  });
}

export async function setSupportCaseStatusAction(input: unknown): Promise<ActionResult> {
  const parsed = supportCaseStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the status." };
  return rpc("set_support_case_status", { p_case_id: parsed.data.caseId, p_status: parsed.data.status });
}

export async function saveCmsEntryAction(input: unknown): Promise<ActionResult<{ id?: string }>> {
  const parsed = cmsEntrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the article." };
  return rpc("upsert_cms_entry", {
    p_id: parsed.data.id ?? null,
    p_collection_slug: parsed.data.collection,
    p_title: parsed.data.title,
    p_slug: parsed.data.slug,
    p_excerpt: parsed.data.excerpt ?? null,
    p_body: parsed.data.body,
    p_locale: parsed.data.locale,
  });
}

export async function runCmsAction(input: unknown): Promise<ActionResult> {
  const parsed = cmsActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the action." };
  return rpc("apply_cms_action", { p_entry_id: parsed.data.entryId, p_action: parsed.data.action });
}
