import type { AppRole } from "@/lib/academy/types";
import type { ClinicalReviewStatus, CmsCollectionSlug, CmsStatus } from "@/lib/admin/cms";
import type { PortalRole, UserRecordField } from "@/lib/admin/rbac";

export const ACCOUNT_STATUSES = ["invited", "active", "suspended", "closed"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const NOTE_KINDS = ["clinical", "support", "system"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export const CASE_STATUSES = ["open", "pending", "resolved", "closed"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

export type PortalProfile = {
  id: string;
  fullName: string;
  email: string | null;
  persona: string;
  roles: AppRole[];
  portalRole: PortalRole | null;
};

export type DirectoryUser = {
  id: string;
  fullName: string;
  email: string | null;
  memberCard: string | null;
  accountStatus: AccountStatus;
  teamName: string | null;
  rankName: string | null;
  lastSeenAt: string | null;
  roles: AppRole[];
};

export type StaffNote = {
  id: string;
  subjectUserId: string;
  authorName: string;
  kind: NoteKind;
  body: string;
  createdAt: string;
};

export type SupportCase = {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  topic: string;
  status: CaseStatus;
  priority: CasePriority;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CmsEntrySummary = {
  id: string;
  title: string;
  slug: string;
  collection: CmsCollectionSlug;
  collectionLabel: string;
  status: CmsStatus;
  clinicalReview: ClinicalReviewStatus;
  updatedAt: string;
  publishedAt: string | null;
};

export type CmsEntryRecord = CmsEntrySummary & {
  excerpt: string | null;
  body: string;
  locale: string;
  version: number;
};

export type CaseloadRow = {
  memberId: string;
  memberName: string;
  rankName: string | null;
  accountStatus: AccountStatus;
  lastNoteAt: string | null;
  openTickets: number;
};

export type AuditRow = {
  id: string;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
};

export type PortalOverview = {
  members: number;
  openTickets: number;
  entriesInReview: number;
  publishedEntries: number;
  assignedMembers: number;
  recentAudit: AuditRow[];
};

export type UserRecordView = {
  user: DirectoryUser;
  visibleFields: UserRecordField[];
  notes: StaffNote[];
  tickets: SupportCase[];
  assignedClinicianId: string | null;
  assignedClinicianName: string | null;
};
