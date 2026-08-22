import { z } from "zod";
import { CMS_COLLECTIONS } from "@/lib/admin/cms";
import { ACCOUNT_STATUSES, CASE_PRIORITIES, CASE_STATUSES, NOTE_KINDS } from "@/lib/admin/types";
import { APP_ROLES } from "@/lib/academy/types";

export const accountStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(ACCOUNT_STATUSES),
});

export const staffNoteSchema = z.object({
  subjectUserId: z.string().uuid(),
  kind: z.enum(NOTE_KINDS),
  body: z.string().trim().min(3, "Write a short note.").max(4000),
});

export const supportCaseSchema = z.object({
  memberId: z.string().uuid(),
  title: z.string().trim().min(4).max(160),
  topic: z.string().trim().min(2).max(80),
  priority: z.enum(CASE_PRIORITIES),
});

export const supportCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(CASE_STATUSES),
});

export const cmsEntrySchema = z.object({
  id: z.string().uuid().optional(),
  collection: z.enum(CMS_COLLECTIONS),
  title: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens."),
  excerpt: z.string().trim().max(280).optional(),
  body: z.string().trim().min(8, "Add the article body."),
  locale: z.enum(["en", "tl"]).default("en"),
});

export const cmsActionSchema = z.object({
  entryId: z.string().uuid(),
  action: z.enum(["submit_review", "approve", "reject", "publish", "archive", "restore"]),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(APP_ROLES),
  enabled: z.boolean(),
});

export const assignClinicianSchema = z.object({
  memberId: z.string().uuid(),
  clinicianId: z.string().uuid(),
});
