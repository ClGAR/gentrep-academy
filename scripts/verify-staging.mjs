import {
  createStagingClients,
  findAuthUserByEmail,
} from "./lib/staging-supabase.mjs";

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!adminEmail) throw new Error("ADMIN_EMAIL is required.");

const { service, publicClient } = await createStagingClients();
const count = async (table, configure = (query) => query) => {
  const { count: value, error } = await configure(
    service.from(table).select("id", { count: "exact", head: true }),
  );
  if (error) throw error;
  return value ?? 0;
};

const admin = await findAuthUserByEmail(service, adminEmail);
if (!admin) throw new Error("Approved staging admin user was not found.");

const [
  profiles,
  events,
  bookings,
  attendance,
  completions,
  progress,
  certificates,
  credits,
  rolesResult,
  activePrimaryResult,
  creditResult,
  certResult,
] = await Promise.all([
  count("profiles", (query) => query.eq("is_demo", true)),
  count("training_events", (query) => query.eq("is_demo", true)),
  count("event_bookings"),
  count("attendance_records"),
  count("requirement_completions"),
  count("member_rank_progress"),
  count("certificates"),
  count("trainer_credits"),
  service.from("user_roles").select("user_id, role"),
  service
    .from("trainer_assignments")
    .select("trainer_id")
    .eq("member_id", "10000000-0000-4000-8000-000000000303")
    .eq("assignment_kind", "primary")
    .is("ended_at", null)
    .single(),
  service.from("trainer_credits").select("primary_trainer_id").single(),
  service.from("certificates").select("verification_code").limit(1).single(),
]);

for (const result of [rolesResult, activePrimaryResult, creditResult, certResult]) {
  if (result.error) throw result.error;
}

const adminRoles = rolesResult.data.filter((row) => row.user_id === admin.id).map((row) => row.role);
if (adminRoles.length !== 1 || adminRoles[0] !== "admin") {
  throw new Error("Approved admin does not have exactly the admin role.");
}
const duplicatedRoles = Object.values(
  rolesResult.data.reduce((totals, row) => {
    totals[row.user_id] = (totals[row.user_id] ?? 0) + 1;
    return totals;
  }, {}),
).some((total) => total !== 1);
if (duplicatedRoles) throw new Error("At least one staging identity has multiple application roles.");
if (activePrimaryResult.data.trainer_id !== "10000000-0000-4000-8000-000000000202") {
  throw new Error("Active primary-trainer fixture is inconsistent.");
}
if (creditResult.data.primary_trainer_id !== "10000000-0000-4000-8000-000000000201") {
  throw new Error("Historical trainer credit moved after reassignment.");
}

const { data: publicCertificate, error: publicError } = await publicClient.rpc("verify_certificate", {
  p_code: certResult.data.verification_code,
});
if (publicError) throw publicError;
if (!Array.isArray(publicCertificate) || publicCertificate.length !== 1) {
  throw new Error("Public certificate verification failed.");
}

const roleCounts = rolesResult.data.reduce((totals, row) => {
  totals[row.role] = (totals[row.role] ?? 0) + 1;
  return totals;
}, {});

console.log(JSON.stringify({
  admin: {
    email: adminEmail,
    userId: admin.id,
    role: "admin",
    setupComplete: Boolean(admin.email_confirmed_at),
  },
  counts: {
    profiles,
    roles: roleCounts,
    events,
    bookings,
    attendance,
    completions,
    progress,
    certificates,
    trainerCredits: credits,
  },
  invariants: {
    oneRolePerIdentity: true,
    historicalCreditPreserved: true,
    publicCertificateVerification: true,
  },
}));
