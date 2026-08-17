import {
  createStagingClients,
  findAuthUserByEmail,
} from "./lib/staging-supabase.mjs";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const redirectTo = process.env.ADMIN_REDIRECT_TO?.trim();

if (!email || !email.includes("@")) throw new Error("ADMIN_EMAIL must be a valid email address.");
if (!redirectTo || !redirectTo.startsWith("https://")) {
  throw new Error("ADMIN_REDIRECT_TO must be the HTTPS Vercel preview login URL.");
}

const { service } = await createStagingClients();
let user = await findAuthUserByEmail(service, email);
let invitationStatus = "reused";

if (!user) {
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error) throw error;
  user = data.user;
  invitationStatus = "invited";
}

if (!user?.id) throw new Error("Supabase did not return an Auth user ID.");

const { error: roleError } = await service.rpc("bootstrap_staging_admin", {
  p_user_id: user.id,
});
if (roleError) throw roleError;

const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
  service.from("profiles").select("id").eq("id", user.id).single(),
  service.from("user_roles").select("role").eq("user_id", user.id),
]);
if (profileError) throw profileError;
if (rolesError) throw rolesError;
const roleNames = (roles ?? []).map((row) => row.role);
if (profile.id !== user.id || roleNames.length !== 1 || roleNames[0] !== "admin") {
  throw new Error("Admin bootstrap verification failed.");
}

console.log(JSON.stringify({
  email,
  userId: user.id,
  role: "admin",
  invitationStatus,
  setupComplete: Boolean(user.email_confirmed_at),
}));
