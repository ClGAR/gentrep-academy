import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  formatAcademyEvent,
  requirementHelper,
} from "@/lib/academy/dashboard-mapper";
import {
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
  RankProgressRecord,
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

type ServerSupabaseClient = Awaited<
  ReturnType<typeof createServerSupabaseClient>
>;

export async function getAuthUserId(client?: ServerSupabaseClient) {
  if (!isSupabaseConfigured()) return null;
  const supabase = client ?? (await createServerSupabaseClient());
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
  const userId = await getAuthUserId(supabase);
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
    progressRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, member_card, team_id, current_rank_id")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase
      .from("ranks")
      .select(
        "id, code, name, full_name, phase, eyebrow, pin_label, opens_text, officer_title, abbr, sort_order, citation, metal, insignia_kind, insignia_count",
      )
      .order("sort_order"),
    supabase
      .from("requirements")
      .select(
        "id, rank_id, code, type, title, note, minutes, sort_order, document_id",
      )
      .order("sort_order"),
    supabase
      .from("training_documents")
      .select(
        "id, slug, title, title_tl, version, minutes, blurb, blurb_tl, body, body_tl",
      ),
    supabase
      .from("training_events")
      .select(
        "id, title, event_type, starts_at, venue, host_name, host_rank_code, capacity, seats_taken, status",
      )
      .order("starts_at"),
    supabase
      .from("event_bookings")
      .select(
        "id, event_id, user_id, requirement_id, status, waitlist_position, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("requirement_completions")
      .select(
        "id, user_id, requirement_id, status, completed_at, source, language",
      )
      .eq("user_id", userId),
    supabase
      .from("certificates")
      .select(
        "id, user_id, rank_id, reference_code, verification_code, issued_at, status",
      )
      .eq("user_id", userId),
    supabase
      .from("member_rank_progress")
      .select("rank_id, status, completed_at")
      .eq("user_id", userId),
  ]);

  if (profileRes.error || !profileRes.data) {
    return { ok: false, error: profileRes.error?.message ?? "Profile not found." };
  }
  const profileRow = profileRes.data;

  const loadError =
    rolesRes.error ??
    ranksRes.error ??
    reqsRes.error ??
    docsRes.error ??
    eventsRes.error ??
    bookingsRes.error ??
    completionsRes.error ??
    certsRes.error ??
    progressRes.error;
  if (loadError) {
    return { ok: false, error: loadError.message };
  }

  const ranks = (ranksRes.data ?? []).map((row) => mapRank(row as Record<string, unknown>));
  const requestedRank = rankCode
    ? ranks.find((rank) => rank.code === rankCode)
    : null;
  if (rankCode && !requestedRank) {
    return { ok: false, error: "Rank not found." };
  }
  const selected =
    requestedRank ??
    ranks.find((rank) => rank.id === profileRow.current_rank_id) ??
    ranks[0];
  if (!selected) {
    return { ok: false, error: "Ranks have not been seeded yet." };
  }

  let team: { name: string; telegram_url: string | null } | null = null;
  let teamMemberCount = 0;
  if (profileRow.team_id) {
    const [teamRes, teamCountRes] = await Promise.all([
      supabase
        .from("teams")
        .select("name, telegram_url")
        .eq("id", profileRow.team_id)
        .maybeSingle(),
      supabase
        .from("team_members")
        .select("user_id", { count: "exact", head: true })
        .eq("team_id", profileRow.team_id),
    ]);
    if (teamRes.error || teamCountRes.error) {
      return {
        ok: false,
        error:
          teamRes.error?.message ??
          teamCountRes.error?.message ??
          "Team data could not be loaded.",
      };
    }
    team = teamRes.data;
    teamMemberCount = teamCountRes.count ?? 0;
  }

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
  const now = Date.now();

  const eventRecords: EventRecord[] = events.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    eventType: String(row.event_type),
    startsAt: String(row.starts_at),
    venue: String(row.venue),
    hostName: String(row.host_name),
    hostRankCode: (row.host_rank_code ?? "BASE") as RankCode,
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
  const selectedDocumentIds = new Set(
    selectedReqs
      .map((req) => req.documentId)
      .filter((id): id is string => Boolean(id)),
  );
  const selectedDocuments = documents.filter((document) =>
    selectedDocumentIds.has(document.id),
  );
  const views: RequirementView[] = selectedReqs.map((req) => {
    const completion = completions.find((row) => row.requirement_id === req.id);
    const activeBooking = bookings.find(
      (row) =>
        row.requirement_id === req.id &&
        (row.status === "booked" || row.status === "waitlisted"),
    );
    const latestBooking = bookings.find(
      (row) => row.requirement_id === req.id,
    );
    const status =
      (completion?.status as ProgressStatus | undefined) ??
      (activeBooking?.status as ProgressStatus | undefined) ??
      "open";
    const bookedEvent = activeBooking
      ? eventRecords.find((event) => event.id === activeBooking.event_id) ?? null
      : null;
    const historicalEvent = latestBooking
      ? eventRecords.find((event) => event.id === latestBooking.event_id) ?? null
      : null;
    const matchingEvents = eventRecords.filter(
      (event) =>
        event.eventType === req.title &&
        event.status === "scheduled" &&
        new Date(event.startsAt).getTime() > now,
    );
    const completedAt = (completion?.completed_at as string | null | undefined) ?? null;
    const source = (completion?.source as string | null | undefined) ?? null;
    const helper = requirementHelper({
      requirement: req,
      status,
      completedAt,
      language:
        (completion?.language as "en" | "tl" | null | undefined) ?? null,
      bookedEvent,
      historicalEvent,
      matchingEventCount: matchingEvents.length,
      waitlistPosition:
        (activeBooking?.waitlist_position as number | null | undefined) ??
        null,
    });
    return {
      ...req,
      status,
      helper,
      completedAt,
      source,
      bookedEvent,
      bookingId: activeBooking ? String(activeBooking.id) : null,
      matchingEvents,
    };
  });

  const rankProgress: RankProgressRecord[] = (progressRes.data ?? [])
    .map((row) => {
      const rank = ranks.find((item) => item.id === row.rank_id);
      if (!rank) return null;
      return {
        rankId: rank.id,
        rankCode: rank.code,
        status: row.status as RankProgressRecord["status"],
        completedAt: row.completed_at,
      };
    })
    .filter((row): row is RankProgressRecord => Boolean(row));
  const completedRankCodes = rankProgress
    .filter((item) => item.status === "complete")
    .map((item) => item.rankCode);

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
      verificationCode: row.verification_code,
      issuedAt: row.issued_at,
      status: row.status,
      memberName: String(profileRow.full_name),
    };
  });

  const profile: ProfileRecord = {
    id: profileRow.id,
    fullName: profileRow.full_name,
    teamName: team?.name ?? null,
    teamTelegramUrl: team?.telegram_url ?? null,
    teamMemberCount,
    memberCard: profileRow.member_card,
    currentRankCode: (ranks.find((rank) => rank.id === profileRow.current_rank_id)?.code ??
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
      documents: selectedDocuments,
      rankProgress,
      certificates,
      lockedReason: rankLockReason(selected.code, completedRankCodes, rankNames),
    },
  };
}

export function formatEventWhen(event: EventRecord) {
  return formatAcademyEvent(event);
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
    .eq("trainer_id", userId)
    .is("ended_at", null);
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

export async function loadPublicCertificate(code: string): Promise<PublicCertificate | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("verify_certificate", { p_code: code });
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
