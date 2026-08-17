import type {
  EventRecord,
  ProgressStatus,
  RequirementRecord,
  RequirementType,
} from "@/lib/academy/types";

const ACADEMY_TIME_ZONE = "Asia/Manila";

export function formatAcademyShortDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "short",
    timeZone: ACADEMY_TIME_ZONE,
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return day && month ? `${day} ${month}` : null;
}

export function formatAcademyEvent(event: EventRecord) {
  const date = new Date(event.startsAt);
  const weekday = date.toLocaleDateString("en-PH", {
    weekday: "short",
    timeZone: ACADEMY_TIME_ZONE,
  });
  return `${weekday} ${formatAcademyShortDate(event.startsAt) ?? ""}, ${event.venue}`;
}

export function completedRequirementHelper(input: {
  type: RequirementType;
  completedAt: string | null;
  language: "en" | "tl" | null;
}) {
  const when = formatAcademyShortDate(input.completedAt);
  const suffix = when ? ` · ${when}` : "";

  if (input.type === "document") {
    return `Agreed${input.language === "tl" ? " sa Tagalog" : ""}${suffix}`;
  }
  if (input.type === "attendance") return `Attended${suffix}`;
  if (input.type === "demonstration") return `Signed off${suffix}`;
  if (input.type === "derived") return `Trainee certified${suffix}`;
  return `Recorded${suffix}`;
}

export function requirementHelper(input: {
  requirement: RequirementRecord;
  status: ProgressStatus;
  completedAt: string | null;
  language: "en" | "tl" | null;
  bookedEvent: EventRecord | null;
  historicalEvent: EventRecord | null;
  matchingEventCount: number;
  waitlistPosition: number | null;
}) {
  const { requirement, status } = input;

  if (status === "done") {
    return completedRequirementHelper({
      type: requirement.type,
      completedAt: input.completedAt,
      language: input.language,
    });
  }
  if (status === "booked" && input.bookedEvent) {
    return `Booked · ${formatAcademyEvent(input.bookedEvent)}`;
  }
  if (status === "waitlisted") {
    const position = input.waitlistPosition ? ` · #${input.waitlistPosition}` : "";
    return input.bookedEvent
      ? `Waitlisted${position} · ${formatAcademyEvent(input.bookedEvent)}`
      : `On the waitlist${position}`;
  }
  if (status === "missed") {
    const when = formatAcademyShortDate(input.historicalEvent?.startsAt);
    return `Missed${when ? ` · ${when}` : ""} — pick another date`;
  }
  if (status === "rejected") {
    return "Not signed off — review with your trainer";
  }
  if (requirement.type === "attendance") {
    return input.matchingEventCount
      ? `${input.matchingEventCount} dates posted`
      : "No dates posted yet";
  }
  if (requirement.type === "document") {
    return `Video ${requirement.minutes ?? ""}${requirement.documentId ? " · then read and agree" : ""}`.trim();
  }
  return requirement.note ?? "";
}
