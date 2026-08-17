import type { BookingStatus, ProgressStatus, RankCode } from "@/lib/academy/types";

export function previousRankCode(code: RankCode): RankCode | null {
  const order: RankCode[] = ["BASE", "TL", "SL", "PL", "CC"];
  const index = order.indexOf(code);
  return index <= 0 ? null : order[index - 1];
}

export function rankLockReason(
  code: RankCode,
  completedRankCodes: RankCode[],
  rankNames: Record<RankCode, string>,
): string | null {
  const order: RankCode[] = ["BASE", "TL", "SL", "PL", "CC"];
  const targetIndex = order.indexOf(code);
  if (targetIndex <= 0) return null;
  const firstIncomplete = order
    .slice(0, targetIndex)
    .find((rankCode) => !completedRankCodes.includes(rankCode));
  return firstIncomplete ? `Finish ${rankNames[firstIncomplete]} first` : null;
}

export function allRequirementsDone(statuses: ProgressStatus[]) {
  return statuses.length > 0 && statuses.every((status) => status === "done");
}

export function nextOpenRequirement<T extends { status: ProgressStatus }>(
  items: T[],
) {
  return items.find(
    (item) =>
      item.status === "open" ||
      item.status === "missed" ||
      item.status === "rejected",
  ) ?? null;
}

export function canMemberBook(input: {
  eventStatus: "scheduled" | "cancelled" | "completed";
  startsAt: string;
  now: string;
  existingActiveBooking: boolean;
  remainingSeats: number;
}) {
  if (input.eventStatus !== "scheduled") {
    return { ok: false as const, reason: "This session is not open for booking." };
  }
  if (new Date(input.startsAt).getTime() <= new Date(input.now).getTime()) {
    return { ok: false as const, reason: "That session has already started." };
  }
  if (input.existingActiveBooking) {
    return { ok: false as const, reason: "You already have a seat or waitlist place for this requirement." };
  }
  return { ok: true as const, waitlist: input.remainingSeats <= 0 };
}

export function canMemberCancel(status: BookingStatus) {
  return status === "booked" || status === "waitlisted";
}

export function promoteWaitlist(input: {
  capacity: number;
  bookedCountAfterCancel: number;
  waitlisted: Array<{ id: string; createdAt: string }>;
}) {
  if (input.bookedCountAfterCancel >= input.capacity) return null;
  const ordered = [...input.waitlisted].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  return ordered[0] ?? null;
}

export function canIssueCertificate(input: {
  requirementCount: number;
  verifiedCount: number;
  existingCertificate: boolean;
}) {
  if (input.existingCertificate) {
    return { ok: false as const, reason: "A certificate already exists for this member and rank." };
  }
  if (input.requirementCount === 0 || input.verifiedCount < input.requirementCount) {
    return { ok: false as const, reason: "All requirements must be verified before a certificate can be issued." };
  }
  return { ok: true as const };
}

export function publicCertificatePayload(input: {
  id: string;
  memberName: string;
  rankFullName: string;
  referenceCode: string;
  issuedAt: string;
  status: "issued" | "revoked";
}) {
  return {
    id: input.id,
    memberName: input.memberName,
    rank: input.rankFullName,
    referenceCode: input.referenceCode,
    issuedAt: input.issuedAt,
    status: input.status,
  };
}
