import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const bookEventSchema = z.object({
  eventId: z.string().uuid(),
  requirementId: z.string().uuid(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

export const acceptDocumentSchema = z.object({
  documentId: z.string().uuid(),
  requirementId: z.string().uuid(),
  language: z.enum(["en", "tl"]),
  watched: z.boolean().refine((value) => value === true, "Watch the video before agreeing."),
});

export const attendanceSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["attended", "absent"]),
  notes: z.string().max(500).optional(),
});

export const demonstrationSchema = z.object({
  memberId: z.string().uuid(),
  requirementId: z.string().uuid(),
  status: z.enum(["confirmed", "rejected"]),
  notes: z.string().max(500).optional(),
});

export const issueCertificateSchema = z.object({
  memberId: z.string().uuid(),
  rankId: z.string().uuid(),
});
