"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  acceptDocumentSchema,
  attendanceSchema,
  bookEventSchema,
  cancelBookingSchema,
  demonstrationSchema,
  issueCertificateSchema,
} from "@/lib/schemas/academy";
import { isSupabaseConfigured } from "@/lib/env";
import { toPublicErrorMessage } from "@/lib/supabase/jwt";

export type ActionResult<T = Record<string, unknown>> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<ActionResult<T>> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }
  const supabase = await createServerSupabaseClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  if (authError || !claims?.claims?.sub) {
    return { ok: false, error: "Sign in to continue." };
  }
  const { data, error } = await supabase.rpc(name, args);
  if (error) {
    return { ok: false, error: toPublicErrorMessage(error.message) };
  }
  revalidatePath("/academy");
  revalidatePath("/staff/events");
  revalidatePath("/trainer/verifications");
  revalidatePath("/admin");
  return { ok: true, data: data as T };
}

export async function bookEventAction(input: unknown): Promise<ActionResult> {
  const parsed = bookEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid booking request." };
  return rpc("book_event", {
    p_event_id: parsed.data.eventId,
    p_requirement_id: parsed.data.requirementId,
  });
}

export async function cancelBookingAction(input: unknown): Promise<ActionResult> {
  const parsed = cancelBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid cancellation request." };
  return rpc("cancel_booking", { p_booking_id: parsed.data.bookingId });
}

export async function acceptDocumentAction(input: unknown): Promise<ActionResult> {
  const parsed = acceptDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Review the item, then agree." };
  }
  return rpc("accept_document", {
    p_document_id: parsed.data.documentId,
    p_requirement_id: parsed.data.requirementId,
    p_language: parsed.data.language,
  });
}

export async function recordAttendanceAction(input: unknown): Promise<ActionResult> {
  const parsed = attendanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid attendance request." };
  return rpc("record_attendance", {
    p_booking_id: parsed.data.bookingId,
    p_status: parsed.data.status,
    p_notes: parsed.data.notes ?? null,
  });
}

export async function verifyDemonstrationAction(input: unknown): Promise<ActionResult> {
  const parsed = demonstrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid verification request." };
  return rpc("verify_demonstration", {
    p_member_id: parsed.data.memberId,
    p_requirement_id: parsed.data.requirementId,
    p_status: parsed.data.status,
    p_notes: parsed.data.notes ?? null,
  });
}

export async function issueCertificateAction(input: unknown): Promise<ActionResult> {
  const parsed = issueCertificateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid certificate request." };
  const result = await rpc<{ id: string; reference_code: string }>("issue_certificate", {
    p_member_id: parsed.data.memberId,
    p_rank_id: parsed.data.rankId,
  });
  if (result.ok) {
    revalidatePath("/academy/certificates");
    revalidatePath("/certificates/verify");
  }
  return result;
}
