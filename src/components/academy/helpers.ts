import { rankLockReason } from "@/lib/academy/rules";
import type {
  EventRecord,
  ProgressStatus,
  RankProgressRecord,
  RankRecord,
  RequirementView,
} from "@/lib/academy/types";

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function eventDay(startsAt: string) {
  const date = new Date(startsAt);
  return {
    weekday: date.toLocaleDateString("en-PH", {
      weekday: "short",
      timeZone: "Asia/Manila",
    }),
    day: date.toLocaleDateString("en-PH", {
      day: "numeric",
      timeZone: "Asia/Manila",
    }),
    month: date.toLocaleDateString("en-PH", {
      month: "short",
      timeZone: "Asia/Manila",
    }),
    when: date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    }),
  };
}

export function rankLockMessage(
  rank: RankRecord,
  ranks: RankRecord[],
  rankProgress: RankProgressRecord[],
) {
  const completed = new Set(
    rankProgress
      .filter((item) => item.status === "complete")
      .map((item) => item.rankCode),
  );
  const names = Object.fromEntries(
    ranks.map((item) => [item.code, item.fullName]),
  ) as Record<RankRecord["code"], string>;
  return rankLockReason(rank.code, [...completed], names);
}

export function walkCompletedRequirement(req: RequirementView): RequirementView {
  const completedAt = "2026-08-30T00:00:00+08:00";
  if (req.type === "document") {
    return {
      ...req,
      status: "done",
      helper: "Agreed · 28 Jul",
      completedAt,
      source: "document",
    };
  }
  if (req.type === "demonstration") {
    return {
      ...req,
      status: "done",
      helper: "Signed off · Rey T.",
      completedAt,
      source: "trainer",
    };
  }
  if (req.type === "derived") {
    return {
      ...req,
      status: "done",
      helper: "Marilou D. certified",
      completedAt,
      source: "derived",
    };
  }
  return {
    ...req,
    status: "done",
    helper: "Attended · 16 Aug",
    completedAt,
    source: "attendance",
    bookedEvent: null,
    bookingId: null,
  };
}

export function rankIsComplete(
  rank: RankRecord,
  rankProgress: RankProgressRecord[],
) {
  return rankProgress.some(
    (item) => item.rankId === rank.id && item.status === "complete",
  );
}

export function statusColor(status: ProgressStatus) {
  if (status === "done") return "var(--ga-good)";
  if (status === "booked" || status === "waitlisted") return "var(--ga-warn)";
  if (status === "missed" || status === "rejected") return "var(--ga-clay)";
  return "var(--ga-mute)";
}

export function requirementActionLabel(
  requirement: Pick<RequirementView, "type" | "status">,
  compact = false,
) {
  if (requirement.type === "document") {
    return compact ? "Review" : "Review the item";
  }
  if (requirement.type === "attendance") {
    return requirement.status === "missed"
      ? compact
        ? "Pick again"
        : "Pick another date"
      : compact
        ? "Pick a date"
        : "Pick a date";
  }
  if (requirement.type === "demonstration") {
    return compact ? "View" : "View sign-off";
  }
  return compact ? "View" : "View progress";
}

export function teamFullName(name: string | null) {
  const short = (name ?? "Unassigned").replace(/^Team\s+/i, "");
  return `Team ${short}`;
}

export function remainingSeats(event: EventRecord) {
  return event.capacity - event.bookedCount;
}

export function rankInsigniaSize(code: RankRecord["code"], context: "side" | "ladder" | "plate" | "about" | "host" | "cert") {
  if (context === "cert") return code === "CC" ? 50 : code === "BASE" ? 52 : 42;
  if (context === "plate") return code === "CC" ? 26 : code === "BASE" ? 28 : 17;
  if (context === "about") return code === "CC" ? 22 : code === "BASE" ? 24 : 14;
  if (context === "side") return code === "CC" ? 20 : code === "BASE" ? 22 : 13;
  if (context === "ladder") return code === "CC" ? 17 : code === "BASE" ? 18 : 11;
  return code === "CC" ? 12 : 8;
}
