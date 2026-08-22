import type { AppRole } from "@/lib/academy/types";

export const PORTAL_ROLES = ["admin", "clinician", "support"] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export const PORTAL_PERSONAS: Record<PortalRole, string> = {
  admin: "Super Admin",
  clinician: "Clinician / Dietitian",
  support: "Customer Support",
};

export const CAPABILITIES = [
  "portal.access",
  "overview.read",
  "users.directory",
  "users.read_assigned",
  "users.read_pii",
  "users.read_clinical",
  "users.write_profile",
  "users.write_status",
  "users.write_roles",
  "caseload.read",
  "caseload.write",
  "notes.write_clinical",
  "notes.write_support",
  "content.read",
  "content.write",
  "content.clinical_review",
  "content.publish",
  "tickets.read",
  "tickets.write",
  "audit.read",
  "settings.write",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const USER_RECORD_FIELDS = [
  "fullName",
  "email",
  "memberCard",
  "accountStatus",
  "roles",
  "team",
  "rank",
  "lastSeen",
  "clinicalNotes",
  "supportNotes",
  "tickets",
  "caseload",
] as const;

export type UserRecordField = (typeof USER_RECORD_FIELDS)[number];

const ROLE_CAPABILITIES: Record<PortalRole, readonly Capability[]> = {
  admin: CAPABILITIES,
  clinician: [
    "portal.access",
    "overview.read",
    "users.read_assigned",
    "users.read_pii",
    "users.read_clinical",
    "users.write_profile",
    "caseload.read",
    "caseload.write",
    "notes.write_clinical",
    "content.read",
    "content.write",
    "content.clinical_review",
  ],
  support: [
    "portal.access",
    "overview.read",
    "users.directory",
    "users.read_assigned",
    "users.read_pii",
    "users.write_profile",
    "users.write_status",
    "notes.write_support",
    "content.read",
    "tickets.read",
    "tickets.write",
  ],
};

const ROLE_USER_FIELDS: Record<PortalRole, readonly UserRecordField[]> = {
  admin: USER_RECORD_FIELDS,
  clinician: [
    "fullName",
    "email",
    "accountStatus",
    "team",
    "rank",
    "lastSeen",
    "clinicalNotes",
    "caseload",
  ],
  support: [
    "fullName",
    "email",
    "memberCard",
    "accountStatus",
    "team",
    "rank",
    "lastSeen",
    "supportNotes",
    "tickets",
  ],
};

export type PortalNavItem = {
  href: string;
  label: string;
  eyebrow: string;
  capability: Capability;
  section: "work" | "system";
};

export const PORTAL_NAV: readonly PortalNavItem[] = [
  { href: "/admin", label: "Today", eyebrow: "Home", capability: "overview.read", section: "work" },
  { href: "/admin/users", label: "People", eyebrow: "Directory", capability: "users.directory", section: "work" },
  { href: "/admin/caseload", label: "Caseload", eyebrow: "Care", capability: "caseload.read", section: "work" },
  { href: "/admin/content", label: "Content", eyebrow: "CMS", capability: "content.read", section: "work" },
  { href: "/admin/tickets", label: "Tickets", eyebrow: "Support", capability: "tickets.read", section: "work" },
  { href: "/admin/audit", label: "Audit", eyebrow: "System", capability: "audit.read", section: "system" },
];

export function isPortalRole(role: string): role is PortalRole {
  return (PORTAL_ROLES as readonly string[]).includes(role);
}

export function portalRolesOf(roles: readonly string[]): PortalRole[] {
  return roles.filter(isPortalRole);
}

export function primaryPortalRole(roles: readonly string[]): PortalRole | null {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("clinician")) return "clinician";
  if (roles.includes("support")) return "support";
  return null;
}

export function capabilitiesFor(roles: readonly string[]): Set<Capability> {
  const caps = new Set<Capability>();
  for (const role of portalRolesOf(roles)) {
    for (const cap of ROLE_CAPABILITIES[role]) caps.add(cap);
  }
  return caps;
}

export function hasCapability(roles: readonly string[], capability: Capability): boolean {
  return capabilitiesFor(roles).has(capability);
}

export function hasAnyCapability(
  roles: readonly string[],
  needed: Capability | readonly Capability[],
): boolean {
  const list = typeof needed === "string" ? [needed] : needed;
  return list.some((cap) => hasCapability(roles, cap));
}

export function userRecordFieldsFor(roles: readonly string[]): Set<UserRecordField> {
  const fields = new Set<UserRecordField>();
  for (const role of portalRolesOf(roles)) {
    for (const field of ROLE_USER_FIELDS[role]) fields.add(field);
  }
  return fields;
}

export function canViewUserField(roles: readonly string[], field: UserRecordField): boolean {
  return userRecordFieldsFor(roles).has(field);
}

export function navFor(roles: readonly string[]): PortalNavItem[] {
  return PORTAL_NAV.filter((item) => hasCapability(roles, item.capability));
}

export function homePath(roles: readonly string[]): string {
  if (primaryPortalRole(roles)) return "/admin";
  if (roles.includes("trainer")) return "/trainer/verifications";
  if (roles.includes("staff")) return "/staff/events";
  return "/academy";
}

export function personaLabel(roles: readonly string[]): string {
  const primary = primaryPortalRole(roles);
  return primary ? PORTAL_PERSONAS[primary] : "Member";
}

export function canAccessMemberRecord(input: {
  roles: readonly string[];
  actorId: string;
  memberId: string;
  assignedMemberIds: readonly string[];
}): boolean {
  if (hasCapability(input.roles, "users.directory")) return true;
  if (!hasCapability(input.roles, "users.read_assigned")) return false;
  return input.assignedMemberIds.includes(input.memberId) || input.actorId === input.memberId;
}

export function academyDeskLinks(roles: readonly AppRole[] | readonly string[]) {
  if (!roles.includes("admin")) return [];
  return [
    { href: "/academy", label: "Member dashboard" },
    { href: "/staff/events", label: "Staff check-in" },
    { href: "/trainer/verifications", label: "Trainer queue" },
  ];
}
