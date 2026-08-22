import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole } from "@/lib/academy/types";
import { getAuthUserId } from "@/lib/academy/queries";
import {
  canAccessMemberRecord,
  canViewUserField,
  hasCapability,
  personaLabel,
  primaryPortalRole,
  userRecordFieldsFor,
} from "@/lib/admin/rbac";
import type { CmsCollectionSlug, ClinicalReviewStatus, CmsStatus } from "@/lib/admin/cms";
import type {
  AccountStatus,
  AuditRow,
  CaseloadRow,
  CmsEntryRecord,
  CmsEntrySummary,
  DirectoryUser,
  PortalOverview,
  PortalProfile,
  StaffNote,
  SupportCase,
  UserRecordView,
} from "@/lib/admin/types";

function asRole(value: unknown): AppRole {
  return String(value) as AppRole;
}

async function rolesByUser(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, userIds: string[]) {
  if (userIds.length === 0) return new Map<string, AppRole[]>();
  const { data } = await supabase.from("user_roles").select("user_id, role").in("user_id", userIds);
  const map = new Map<string, AppRole[]>();
  for (const row of data ?? []) {
    const list = map.get(row.user_id) ?? [];
    list.push(asRole(row.role));
    map.set(row.user_id, list);
  }
  return map;
}

export async function loadPortalProfile(userId: string): Promise<PortalProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (!profile) return null;
  const roles = (roleRows ?? []).map((row) => asRole(row.role));
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email ?? null,
    roles,
    portalRole: primaryPortalRole(roles),
    persona: personaLabel(roles),
  };
}

export async function loadPortalOverview(roles: readonly string[]): Promise<PortalOverview> {
  const empty: PortalOverview = {
    members: 0,
    openTickets: 0,
    entriesInReview: 0,
    publishedEntries: 0,
    assignedMembers: 0,
    recentAudit: [],
  };
  if (!isSupabaseConfigured()) return empty;
  const supabase = await createServerSupabaseClient();
  const userId = await getAuthUserId();
  const [
    members,
    tickets,
    inReview,
    published,
    assigned,
    audit,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("support_cases").select("id", { count: "exact", head: true }).in("status", ["open", "pending"]),
    supabase.from("cms_entries").select("id", { count: "exact", head: true }).eq("status", "in_review"),
    supabase.from("cms_entries").select("id", { count: "exact", head: true }).eq("status", "published"),
    userId
      ? supabase
          .from("clinician_assignments")
          .select("member_id", { count: "exact", head: true })
          .eq("clinician_id", userId)
          .eq("status", "active")
      : Promise.resolve({ count: 0 }),
    roles.includes("admin")
      ? supabase
          .from("audit_log")
          .select("id, actor_id, action, entity_type, entity_id, created_at")
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
  ]);

  const actorIds = Array.from(
    new Set((audit.data ?? []).map((row: { actor_id?: string | null }) => row.actor_id).filter(Boolean) as string[]),
  );
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] };
  const actorMap = new Map((actors ?? []).map((row) => [row.id, row.full_name]));

  return {
    members: members.count ?? 0,
    openTickets: tickets.count ?? 0,
    entriesInReview: inReview.count ?? 0,
    publishedEntries: published.count ?? 0,
    assignedMembers: assigned.count ?? 0,
    recentAudit: ((audit.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      actorName: actorMap.get(String(row.actor_id)) ?? null,
      action: String(row.action),
      entityType: String(row.entity_type),
      entityId: row.entity_id ? String(row.entity_id) : null,
      createdAt: String(row.created_at),
    })),
  };
}

export async function loadDirectory(input: {
  q?: string;
  status?: string;
  roles: readonly string[];
  actorId: string;
}): Promise<DirectoryUser[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, member_card, account_status, last_seen_at, teams:team_id(name), ranks:current_rank_id(name)")
    .order("full_name");

  if (input.status && input.status !== "all") {
    query = query.eq("account_status", input.status);
  }
  if (input.q?.trim()) {
    const needle = `%${input.q.trim()}%`;
    query = query.or(`full_name.ilike.${needle},email.ilike.${needle},member_card.ilike.${needle}`);
  }

  const { data, error } = await query.limit(80);
  if (error || !data) return [];

  const roleMap = await rolesByUser(
    supabase,
    data.map((row) => row.id),
  );

  const mapped = data.map((row) => {
    const team = row.teams as { name?: string } | { name?: string }[] | null;
    const rank = row.ranks as { name?: string } | { name?: string }[] | null;
    const teamName = Array.isArray(team) ? team[0]?.name : team?.name;
    const rankName = Array.isArray(rank) ? rank[0]?.name : rank?.name;
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email ?? null,
      memberCard: row.member_card ?? null,
      accountStatus: (row.account_status as AccountStatus) ?? "active",
      teamName: teamName ?? null,
      rankName: rankName ?? null,
      lastSeenAt: row.last_seen_at ?? null,
      roles: roleMap.get(row.id) ?? ["member"],
    };
  });

  if (!hasCapability(input.roles, "users.directory")) {
    const assigned = await loadAssignedMemberIds(input.actorId);
    return mapped.filter((row) => assigned.includes(row.id) || row.id === input.actorId);
  }
  return mapped;
}

export async function loadAssignedMemberIds(actorId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("clinician_assignments")
    .select("member_id")
    .eq("clinician_id", actorId)
    .eq("status", "active");
  return (data ?? []).map((row) => row.member_id);
}

export async function loadUserRecord(input: {
  memberId: string;
  actorId: string;
  roles: readonly string[];
}): Promise<UserRecordView | null> {
  const assigned = await loadAssignedMemberIds(input.actorId);
  if (
    !canAccessMemberRecord({
      roles: input.roles,
      actorId: input.actorId,
      memberId: input.memberId,
      assignedMemberIds: assigned,
    })
  ) {
    return null;
  }

  const directory = await loadDirectory({ roles: input.roles, actorId: input.actorId });
  const user = directory.find((row) => row.id === input.memberId);
  if (!user) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, member_card, account_status, last_seen_at, teams:team_id(name), ranks:current_rank_id(name)")
      .eq("id", input.memberId)
      .maybeSingle();
    if (!data) return null;
    const team = data.teams as { name?: string } | null;
    const rank = data.ranks as { name?: string } | null;
    const roleMap = await rolesByUser(supabase, [data.id]);
    return {
      user: {
        id: data.id,
        fullName: data.full_name,
        email: data.email ?? null,
        memberCard: data.member_card ?? null,
        accountStatus: (data.account_status as AccountStatus) ?? "active",
        teamName: (team?.name as string | undefined) ?? null,
        rankName: (rank?.name as string | undefined) ?? null,
        lastSeenAt: data.last_seen_at ?? null,
        roles: roleMap.get(data.id) ?? ["member"],
      },
      visibleFields: [...userRecordFieldsFor(input.roles)],
      notes: await loadNotes(input.memberId, input.roles),
      tickets: await loadTickets({ memberId: input.memberId }),
      ...(await loadAssignedClinician(input.memberId)),
    };
  }

  return {
    user,
    visibleFields: [...userRecordFieldsFor(input.roles)],
    notes: await loadNotes(input.memberId, input.roles),
    tickets: await loadTickets({ memberId: input.memberId }),
    ...(await loadAssignedClinician(input.memberId)),
  };
}

async function loadAssignedClinician(memberId: string): Promise<{
  assignedClinicianId: string | null;
  assignedClinicianName: string | null;
}> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("clinician_assignments")
    .select("clinician_id, profiles:clinician_id(full_name)")
    .eq("member_id", memberId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!data) return { assignedClinicianId: null, assignedClinicianName: null };
  const profile = data.profiles as { full_name?: string } | { full_name?: string }[] | null;
  const name = Array.isArray(profile) ? profile[0]?.full_name ?? null : profile?.full_name ?? null;
  return { assignedClinicianId: data.clinician_id, assignedClinicianName: name };
}

async function loadNotes(memberId: string, roles: readonly string[]): Promise<StaffNote[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("staff_notes")
    .select("id, subject_user_id, author_id, kind, body, created_at, profiles:author_id(full_name)")
    .eq("subject_user_id", memberId)
    .order("created_at", { ascending: false })
    .limit(40);
  return (data ?? [])
    .filter((row) =>
      row.kind === "clinical"
        ? canViewUserField(roles, "clinicalNotes")
        : row.kind === "support"
          ? canViewUserField(roles, "supportNotes")
          : hasCapability(roles, "audit.read"),
    )
    .map((row) => {
      const author = row.profiles as { full_name?: string } | { full_name?: string }[] | null;
      return {
        id: row.id,
        subjectUserId: row.subject_user_id,
        authorName: (Array.isArray(author) ? author[0]?.full_name : author?.full_name) ?? "Staff",
        kind: row.kind,
        body: row.body,
        createdAt: row.created_at,
      };
    });
}

export async function loadTickets(input?: { memberId?: string; status?: string }): Promise<SupportCase[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("support_cases")
    .select("id, member_id, title, topic, status, priority, created_at, updated_at, profiles:member_id(full_name), assignee:assignee_id(full_name)")
    .order("updated_at", { ascending: false })
    .limit(80);
  if (input?.memberId) query = query.eq("member_id", input.memberId);
  if (input?.status && input.status !== "all") query = query.eq("status", input.status);
  const { data } = await query;
  return (data ?? []).map((row) => {
    const member = row.profiles as { full_name?: string } | { full_name?: string }[] | null;
    const assignee = row.assignee as { full_name?: string } | { full_name?: string }[] | null;
    return {
      id: row.id,
      memberId: row.member_id,
      memberName: (Array.isArray(member) ? member[0]?.full_name : member?.full_name) ?? "Member",
      title: row.title,
      topic: row.topic,
      status: row.status,
      priority: row.priority,
      assigneeName: (Array.isArray(assignee) ? assignee[0]?.full_name : assignee?.full_name) ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function loadCaseload(actorId: string, roles: readonly string[]): Promise<CaseloadRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("clinician_assignments")
    .select("member_id, profiles:member_id(full_name, account_status, ranks:current_rank_id(name))")
    .eq("status", "active");
  if (!roles.includes("admin")) {
    query = query.eq("clinician_id", actorId);
  }
  const { data } = await query;
  const memberIds = (data ?? []).map((row) => row.member_id as string);
  const { data: notes } = memberIds.length
    ? await supabase
        .from("staff_notes")
        .select("subject_user_id, created_at")
        .eq("kind", "clinical")
        .in("subject_user_id", memberIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const lastNote = new Map<string, string>();
  for (const note of notes ?? []) {
    if (!lastNote.has(note.subject_user_id)) lastNote.set(note.subject_user_id, note.created_at);
  }
  const { data: tickets } = memberIds.length
    ? await supabase.from("support_cases").select("member_id, status").in("member_id", memberIds)
    : { data: [] };
  const openCounts = new Map<string, number>();
  for (const ticket of tickets ?? []) {
    if (ticket.status === "open" || ticket.status === "pending") {
      openCounts.set(ticket.member_id, (openCounts.get(ticket.member_id) ?? 0) + 1);
    }
  }

  return (data ?? []).map((row) => {
    const profile = row.profiles as
      | { full_name?: string; account_status?: string; ranks?: { name?: string } | { name?: string }[] }
      | null;
    const rank = profile?.ranks;
    const rankName = Array.isArray(rank) ? rank[0]?.name : rank?.name;
    return {
      memberId: row.member_id,
      memberName: profile?.full_name ?? "Member",
      rankName: rankName ?? null,
      accountStatus: (profile?.account_status as AccountStatus) ?? "active",
      lastNoteAt: lastNote.get(row.member_id) ?? null,
      openTickets: openCounts.get(row.member_id) ?? 0,
    };
  });
}

export async function loadCmsLibrary(input?: {
  status?: string;
  collection?: string;
  publishedOnly?: boolean;
}): Promise<CmsEntrySummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("cms_entries")
    .select("id, title, slug, status, clinical_review, updated_at, published_at, cms_collections(slug, name)")
    .order("updated_at", { ascending: false })
    .limit(80);
  if (input?.publishedOnly) query = query.eq("status", "published");
  else if (input?.status && input.status !== "all") query = query.eq("status", input.status);
  const { data } = await query;
  return (data ?? [])
    .map((row) => {
      const collection = row.cms_collections as { slug?: string; name?: string } | { slug?: string; name?: string }[] | null;
      const col = Array.isArray(collection) ? collection[0] : collection;
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        collection: (col?.slug ?? "education") as CmsCollectionSlug,
        collectionLabel: col?.name ?? "Education",
        status: row.status as CmsStatus,
        clinicalReview: row.clinical_review as ClinicalReviewStatus,
        updatedAt: row.updated_at,
        publishedAt: row.published_at,
      };
    })
    .filter((row) => {
      if (input?.publishedOnly && row.collection !== "faq" && row.collection !== "education") return false;
      return !input?.collection || input.collection === "all" || row.collection === input.collection;
    });
}

export async function loadCmsEntry(id: string): Promise<CmsEntryRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("cms_entries")
    .select("id, title, slug, excerpt, body, locale, status, clinical_review, version, updated_at, published_at, cms_collections(slug, name)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const collection = data.cms_collections as { slug?: string; name?: string } | null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    body: data.body,
    locale: data.locale,
    version: data.version,
    collection: (collection?.slug ?? "education") as CmsCollectionSlug,
    collectionLabel: collection?.name ?? "Education",
    status: data.status as CmsStatus,
    clinicalReview: data.clinical_review as ClinicalReviewStatus,
    updatedAt: data.updated_at,
    publishedAt: data.published_at,
  };
}

export async function loadAuditLog(): Promise<AuditRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, actor_id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(80);
  const actorIds = Array.from(new Set((data ?? []).map((row) => row.actor_id).filter(Boolean) as string[]));
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] };
  const actorMap = new Map((actors ?? []).map((row) => [row.id, row.full_name]));
  return (data ?? []).map((row) => ({
    id: row.id,
    actorName: row.actor_id ? actorMap.get(row.actor_id) ?? null : null,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    createdAt: row.created_at,
  }));
}

export async function loadClinicianOptions(): Promise<Array<{ id: string; fullName: string }>> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data: roleRows } = await supabase.from("user_roles").select("user_id").eq("role", "clinician");
  const ids = Array.from(new Set((roleRows ?? []).map((row) => row.user_id)));
  if (ids.length === 0) return [];
  const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids).order("full_name");
  return (data ?? []).map((row) => ({ id: row.id, fullName: row.full_name }));
}

export async function loadPublishedAnswers(): Promise<
  Array<{ id: string; title: string; excerpt: string | null; collection: string }>
> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("cms_entries")
    .select("id, title, excerpt, cms_collections(slug)")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(12);
  return (data ?? [])
    .map((row) => {
      const collection = row.cms_collections as { slug?: string } | { slug?: string }[] | null;
      const slug = Array.isArray(collection) ? collection[0]?.slug : collection?.slug;
      return {
        id: row.id,
        title: row.title,
        excerpt: row.excerpt ?? null,
        collection: slug ?? "education",
      };
    })
    .filter((row) => row.collection === "faq" || row.collection === "education");
}
