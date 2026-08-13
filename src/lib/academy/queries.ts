import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  allRequirementsDone,
  nextOpenRequirement,
  rankLockReason,
} from "@/lib/academy/rules";
import type {
  AppRole,
  CertificateRecord,
  DashboardData,
  DocumentRecord,
  EventRecord,
  ProfileRecord,
  ProgressStatus,
  RankCode,
  RankRecord,
  RequirementRecord,
  RequirementView,
} from "@/lib/academy/types";

function mapRank(row: Record<string, unknown>): RankRecord {
  return {
    id: String(row.id),
    code: row.code as RankCode,
    name: String(row.name),
    fullName: String(row.full_name),
    phase: String(row.phase),
    eyebrow: String(row.eyebrow),
    pinLabel: String(row.pin_label),
    opensText: String(row.opens_text),
    officerTitle: (row.officer_title as string | null) ?? null,
    abbr: (row.abbr as string | null) ?? null,
    sortOrder: Number(row.sort_order),
    citation: String(row.citation),
    metal: row.metal as RankRecord["metal"],
    insigniaKind: row.insignia_kind as RankRecord["insigniaKind"],
    insigniaCount: Number(row.insignia_count),
  };
}

export async function getAuthUserId() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return String(data.claims.sub);
}

export async function loadDashboard(rankCode?: string): Promise<
  | { ok: true; data: DashboardData }
  | { ok: false; error: string; unconfigured?: boolean }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured.", unconfigured: true };
  }

  const supabase = await createServerSupabaseClient();
  const userId = await getAuthUserId();
  if (!userId) {
    return { ok: false, error: "Sign in to open the academy." };
  }

  const [
    profileRes,
    rolesRes,
    ranksRes,
    reqsRes,
    docsRes,
    eventsRes,
    bookingsRes,
    completionsRes,
    certsRes,
    teamRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("ranks").select("*").order("sort_order"),
    supabase.from("requirements").select("*").order("sort_order"),
    supabase.from("training_documents").select("*"),
    supabase.from("training_events").select("*").order("starts_at"),
    supabase.from("event_bookings").select("*").eq("user_id", userId),
    supabase.from("requirement_completions").select("*").eq("user_id", userId),
    supabase.from("certificates").select("*").eq("user_id", userId),
    supabase.from("teams").select("*"),
  ]);

  if (profileRes.error || !profileRes.data) {
    return { ok: false, error: profileRes.error?.message ?? "Profile not found." };
  }

  const ranks = (ranksRes.data ?? []).map((row) => mapRank(row as Record<string, unknown>));
  const selected =
    ranks.find((rank) => rank.code === rankCode) ??
    ranks.find((rank) => rank.id === profileRes.data.current_rank_id) ??
    ranks[0];
  if (!selected) {
    return { ok: false, error: "Ranks have not been seeded yet." };
  }

  const team = (teamRes.data ?? []).find((row) => row.id === profileRes.data.team_id);
  const roles = ((rolesRes.data ?? []) as Array<{ role: AppRole }>).map((row) => row.role);
  const documents: DocumentRecord[] = (docsRes.data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleTl: row.title_tl,
    version: row.version,
    minutes: row.minutes,
    blurb: row.blurb,
    blurbTl: row.blurb_tl,
    body: row.body,
    bodyTl: row.body_tl,
  }));

  const bookings = (bookingsRes.data ?? []) as Array<Record<string, unknown>>;
  const completions = (completionsRes.data ?? []) as Array<Record<string, unknown>>;
  const events = (eventsRes.data ?? []) as Array<Record<string, unknown>>;

  const eventRecords: EventRecord[] = events.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    eventType: String(row.event_type),
    startsAt: String(row.starts_at),
    venue: String(row.venue),
    hostName: String(row.host_name),
    hostRankCode: row.host_rank_code as RankCode,
    capacity: Number(row.capacity),
    bookedCount: Number(row.seats_taken ?? 0),
    status: row.status as EventRecord["status"],
  }));

  const requirements: RequirementRecord[] = (reqsRes.data ?? []).map((row) => ({
    id: row.id,
    rankId: row.rank_id,
    code: row.code,
    type: row.type,
    title: row.title,
    note: row.note,
    minutes: row.minutes,
    sortOrder: row.sort_order,
    documentId: row.document_id,
  }));

  const selectedReqs = requirements.filter((req) => req.rankId === selected.id);
  const views: RequirementView[] = selectedReqs.map((req) => {
    const completion = completions.find((row) => row.requirement_id === req.id);
    const status = (completion?.status as ProgressStatus | undefined) ?? "open";
    const activeBooking = bookings.find(
      (row) =>
        row.requirement_id === req.id &&
        (row.status === "booked" || row.status === "waitlisted"),
    );
    const bookedEvent = activeBooking
      ? eventRecords.find((event) => event.id === activeBooking.event_id) ?? null
      : null;
    const matchingEvents = eventRecords.filter((event) => event.eventType === req.title);
    let helper = req.note ?? "";
    if (status === "done") {
      helper =
        req.type === "document"
          ? `Agreed${completion?.language === "tl" ? " sa Tagalog" : ""}`
          : req.type === "derived"
            ? "Trainee certified"
            : "Recorded";
    } else if (status === "booked" && bookedEvent) {
      helper = `Booked · ${formatEventWhen(bookedEvent)}`;
    } else if (status === "waitlisted") {
      helper = "On the waitlist";
    } else if (status === "missed") {
      helper = "Missed — pick another date";
    } else if (req.type === "attendance") {
      helper = matchingEvents.length
        ? `${matchingEvents.length} dates posted`
        : "No dates posted yet";
    } else if (req.type === "document") {
      helper = `Video ${req.minutes ?? ""}${req.documentId ? " · then read and agree" : ""}`;
    }
    return { ...req, status, helper, bookedEvent, bookingId: activeBooking ? String(activeBooking.id) : null, matchingEvents };
  });

  const completedRankCodes = ranks
    .filter((rank) => {
      const rankReqs = requirements.filter((req) => req.rankId === rank.id);
      const statuses = rankReqs.map((req) => {
        const completion = completions.find((row) => row.requirement_id === req.id);
        return (completion?.status as ProgressStatus | undefined) ?? "open";
      });
      return allRequirementsDone(statuses);
    })
    .map((rank) => rank.code);

  const rankNames = Object.fromEntries(ranks.map((rank) => [rank.code, rank.fullName])) as Record<
    RankCode,
    string
  >;

  const certificates: CertificateRecord[] = (certsRes.data ?? []).map((row) => {
    const rank = ranks.find((item) => item.id === row.rank_id);
    return {
      id: row.id,
      userId: row.user_id,
      rankId: row.rank_id,
      rankCode: (rank?.code ?? "BASE") as RankCode,
      referenceCode: row.reference_code,
      issuedAt: row.issued_at,
      status: row.status,
      memberName: String(profileRes.data.full_name),
    };
  });

  const profile: ProfileRecord = {
    id: profileRes.data.id,
    fullName: profileRes.data.full_name,
    teamName: team?.name ?? null,
    teamTelegramUrl: team?.telegram_url ?? null,
    teamMemberCount: 24,
    memberCard: profileRes.data.member_card,
    currentRankCode: (ranks.find((rank) => rank.id === profileRes.data.current_rank_id)?.code ??
      "BASE") as RankCode,
    roles,
  };

  return {
    ok: true,
    data: {
      profile,
      ranks,
      selectedRank: selected,
      requirements: views,
      documents,
      certificates,
      lockedReason: rankLockReason(selected.code, completedRankCodes, rankNames),
    },
  };
}

export function formatEventWhen(event: EventRecord) {
  const date = new Date(event.startsAt);
  return `${date.toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "short" })}, ${event.venue}`;
}

export { nextOpenRequirement };

export type StaffRosterRow = {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  startsAt: string;
  venue: string;
  memberName: string;
  memberId: string;
  status: string;
};

export async function loadStaffRoster(): Promise<StaffRosterRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("event_bookings")
    .select("id, event_id, user_id, status, training_events(title, starts_at, venue), profiles(full_name)")
    .in("status", ["booked", "waitlisted", "attended", "absent"])
    .order("created_at", { ascending: false });
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const event = row.training_events as Record<string, unknown> | null;
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      bookingId: String(row.id),
      eventId: String(row.event_id),
      eventTitle: String(event?.title ?? "Session"),
      startsAt: String(event?.starts_at ?? ""),
      venue: String(event?.venue ?? ""),
      memberName: String(profile?.full_name ?? "Member"),
      memberId: String(row.user_id),
      status: String(row.status),
    };
  });
}

export type TrainerQueueRow = {
  memberId: string;
  memberName: string;
  requirementId: string;
  requirementTitle: string;
  status: string;
};

export async function loadTrainerQueue(): Promise<TrainerQueueRow[]> {
  const supabase = await createServerSupabaseClient();
  const userId = await getAuthUserId();
  if (!userId) return [];
  const { data: assigned } = await supabase
    .from("trainer_assignments")
    .select("member_id, profiles:member_id(full_name)")
    .eq("trainer_id", userId);
  const members = assigned ?? [];
  const { data: demos } = await supabase
    .from("requirements")
    .select("id, title")
    .eq("type", "demonstration");
  const { data: completions } = await supabase
    .from("requirement_completions")
    .select("user_id, requirement_id, status");
  const rows: TrainerQueueRow[] = [];
  for (const member of members as Array<Record<string, unknown>>) {
    for (const demo of demos ?? []) {
      const completion = (completions ?? []).find(
        (row) => row.user_id === member.member_id && row.requirement_id === demo.id,
      );
      rows.push({
        memberId: String(member.member_id),
        memberName: String((member.profiles as { full_name?: string } | null)?.full_name ?? "Member"),
        requirementId: demo.id,
        requirementTitle: demo.title,
        status: completion?.status ?? "open",
      });
    }
  }
  return rows;
}

export async function loadAdminSummary() {
  const supabase = await createServerSupabaseClient();
  const [{ count: members }, { count: events }, { count: certificates }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("training_events").select("id", { count: "exact", head: true }),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
  ]);
  return {
    members: members ?? 0,
    events: events ?? 0,
    certificates: certificates ?? 0,
  };
}

export type PublicCertificate = {
  id: string;
  memberName: string;
  rankName: string;
  referenceCode: string;
  issuedAt: string;
  status: "issued" | "revoked";
};

export async function loadPublicCertificate(id: string): Promise<PublicCertificate | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("verify_certificate", { p_id: id });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    id: row.id,
    memberName: row.member_name,
    rankName: row.rank_name,
    referenceCode: row.reference_code,
    issuedAt: row.issued_at,
    status: row.status,
  };
}
