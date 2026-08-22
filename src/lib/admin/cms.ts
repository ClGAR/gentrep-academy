import { hasCapability, type PortalRole, primaryPortalRole } from "@/lib/admin/rbac";

export const CMS_STATUSES = ["draft", "in_review", "published", "archived"] as const;
export type CmsStatus = (typeof CMS_STATUSES)[number];

export const CLINICAL_REVIEW_STATUSES = ["not_required", "pending", "approved", "rejected"] as const;
export type ClinicalReviewStatus = (typeof CLINICAL_REVIEW_STATUSES)[number];

export const CMS_COLLECTIONS = ["education", "protocol", "product_copy", "faq", "announcement"] as const;
export type CmsCollectionSlug = (typeof CMS_COLLECTIONS)[number];

export const CLINICAL_COLLECTIONS: readonly CmsCollectionSlug[] = ["protocol", "product_copy"];

export type CmsWorkflowEntry = {
  status: CmsStatus;
  collection: CmsCollectionSlug;
  clinicalReview: ClinicalReviewStatus;
};

export type CmsAction = "save" | "submit_review" | "approve" | "reject" | "publish" | "archive" | "restore";

export function collectionRequiresClinicalReview(collection: CmsCollectionSlug): boolean {
  return CLINICAL_COLLECTIONS.includes(collection);
}

export function defaultClinicalReview(collection: CmsCollectionSlug): ClinicalReviewStatus {
  return collectionRequiresClinicalReview(collection) ? "pending" : "not_required";
}

export function canPerformCmsAction(
  roles: readonly string[],
  entry: CmsWorkflowEntry,
  action: CmsAction,
): boolean {
  const role = primaryPortalRole(roles);
  if (!role) return false;

  switch (action) {
    case "save":
      return hasCapability(roles, "content.write") && entry.status !== "archived";
    case "submit_review":
      return (
        hasCapability(roles, "content.write") &&
        entry.status === "draft" &&
        collectionRequiresClinicalReview(entry.collection)
      );
    case "approve":
    case "reject":
      return (
        hasCapability(roles, "content.clinical_review") &&
        entry.status === "in_review" &&
        entry.clinicalReview === "pending"
      );
    case "publish":
      return hasCapability(roles, "content.publish") && canPublish(entry);
    case "archive":
      return hasCapability(roles, "content.publish") && entry.status === "published";
    case "restore":
      return hasCapability(roles, "content.write") && entry.status === "archived";
    default:
      return false;
  }
}

export function canPublish(entry: CmsWorkflowEntry): boolean {
  if (entry.status === "archived") return false;
  if (!collectionRequiresClinicalReview(entry.collection)) {
    return entry.status === "draft" || entry.status === "published";
  }
  return entry.clinicalReview === "approved";
}

export function applyCmsAction(
  entry: CmsWorkflowEntry,
  action: CmsAction,
): CmsWorkflowEntry | { ok: false; reason: string } {
  switch (action) {
    case "save":
      return entry;
    case "submit_review":
      if (entry.status !== "draft") return { ok: false, reason: "Only drafts can be sent for review." };
      return { ...entry, status: "in_review", clinicalReview: "pending" };
    case "approve":
      if (entry.status !== "in_review") return { ok: false, reason: "Nothing is waiting for review." };
      return { ...entry, clinicalReview: "approved" };
    case "reject":
      if (entry.status !== "in_review") return { ok: false, reason: "Nothing is waiting for review." };
      return { ...entry, status: "draft", clinicalReview: "rejected" };
    case "publish":
      if (!canPublish(entry)) {
        return { ok: false, reason: "Clinical review must be approved before this entry can go live." };
      }
      return { ...entry, status: "published" };
    case "archive":
      if (entry.status !== "published") return { ok: false, reason: "Only live entries can be archived." };
      return { ...entry, status: "archived" };
    case "restore":
      if (entry.status !== "archived") return { ok: false, reason: "Only archived entries can be restored." };
      return { ...entry, status: "draft" };
    default:
      return { ok: false, reason: "Unknown action." };
  }
}

export function clinicianMayEditCollection(role: PortalRole | null, collection: CmsCollectionSlug): boolean {
  if (role === "admin") return true;
  if (role !== "clinician") return false;
  return collection === "protocol" || collection === "education";
}
