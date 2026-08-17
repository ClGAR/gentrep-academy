export const APP_ROLES = ["member", "trainer", "staff", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const REQUIREMENT_TYPES = [
  "document",
  "attendance",
  "demonstration",
  "derived",
] as const;
export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

export const PROGRESS_STATUSES = [
  "open",
  "booked",
  "waitlisted",
  "missed",
  "done",
  "rejected",
] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export const BOOKING_STATUSES = [
  "booked",
  "waitlisted",
  "cancelled",
  "attended",
  "absent",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TYPE_LABELS: Record<RequirementType, string> = {
  document: "Watch and agree",
  attendance: "Attend",
  demonstration: "Show it",
  derived: "Earned by your trainee",
};

export type RankCode = "BASE" | "TL" | "SL" | "PL" | "CC";

export type RankRecord = {
  id: string;
  code: RankCode;
  name: string;
  fullName: string;
  phase: string;
  eyebrow: string;
  pinLabel: string;
  opensText: string;
  officerTitle: string | null;
  abbr: string | null;
  sortOrder: number;
  citation: string;
  metal: "bronze" | "silver" | "gold";
  insigniaKind: "seal" | "bars" | "field";
  insigniaCount: number;
};

export type RequirementRecord = {
  id: string;
  rankId: string;
  code: string;
  type: RequirementType;
  title: string;
  note: string | null;
  minutes: string | null;
  sortOrder: number;
  documentId: string | null;
};

export type DocumentRecord = {
  id: string;
  slug: string;
  title: string;
  titleTl: string | null;
  version: string;
  minutes: string;
  blurb: string;
  blurbTl: string | null;
  body: string | null;
  bodyTl: string | null;
};

export type EventRecord = {
  id: string;
  title: string;
  eventType: string;
  startsAt: string;
  venue: string;
  hostName: string;
  hostRankCode: RankCode;
  capacity: number;
  bookedCount: number;
  status: "scheduled" | "cancelled" | "completed";
};

export type BookingRecord = {
  id: string;
  eventId: string;
  userId: string;
  requirementId: string;
  status: BookingStatus;
  waitlistPosition: number | null;
};

export type CompletionRecord = {
  id: string;
  userId: string;
  requirementId: string;
  status: ProgressStatus;
  completedAt: string | null;
  source: string | null;
  language: "en" | "tl" | null;
  evidence: Record<string, unknown> | null;
};

export type RankProgressRecord = {
  rankId: string;
  rankCode: RankCode;
  status: "in_progress" | "complete";
  completedAt: string | null;
};

export type CertificateRecord = {
  id: string;
  userId: string;
  rankId: string;
  rankCode: RankCode;
  referenceCode: string;
  verificationCode: string;
  issuedAt: string;
  status: "issued" | "revoked";
  memberName: string;
};

export type ProfileRecord = {
  id: string;
  fullName: string;
  teamName: string | null;
  teamTelegramUrl: string | null;
  teamMemberCount: number;
  memberCard: string | null;
  currentRankCode: RankCode;
  roles: AppRole[];
};

export type RequirementView = RequirementRecord & {
  status: ProgressStatus;
  helper: string;
  completedAt: string | null;
  source: string | null;
  bookedEvent: EventRecord | null;
  bookingId: string | null;
  matchingEvents: EventRecord[];
};

export type DashboardData = {
  profile: ProfileRecord;
  ranks: RankRecord[];
  selectedRank: RankRecord;
  requirements: RequirementView[];
  documents: DocumentRecord[];
  rankProgress: RankProgressRecord[];
  certificates: CertificateRecord[];
  lockedReason: string | null;
};
