import { createClient } from "@supabase/supabase-js";

export const STAGING_PROJECT_REF = "qipwvvhmhxqzlmezvjxu";

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

function keyValue(entry) {
  return entry?.api_key ?? entry?.key ?? entry?.value ?? null;
}

export async function createStagingClients() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  if (projectRef !== STAGING_PROJECT_REF) {
    throw new Error(`Refusing to run outside the approved staging project ${STAGING_PROJECT_REF}.`);
  }

  const raw = await readStdin();
  if (!raw) throw new Error("Pipe Supabase project API-key JSON to this command.");
  const parsed = JSON.parse(raw);
  const entries = Array.isArray(parsed) ? parsed : parsed.data ?? parsed.keys ?? [];
  const serviceEntry = entries.find((entry) =>
    ["service_role", "secret"].includes(String(entry.name ?? entry.type ?? "").toLowerCase()),
  );
  const publicEntry = entries.find((entry) =>
    ["anon", "publishable"].includes(String(entry.name ?? entry.type ?? "").toLowerCase()),
  );
  const serviceKey = keyValue(serviceEntry);
  const publicKey = keyValue(publicEntry);
  if (!serviceKey || !publicKey) {
    throw new Error("The Supabase API-key response did not contain both server and public staging keys.");
  }

  const url = `https://${projectRef}.supabase.co`;
  const options = { auth: { autoRefreshToken: false, persistSession: false } };
  return {
    service: createClient(url, serviceKey, options),
    publicClient: createClient(url, publicKey, options),
  };
}

export async function findAuthUserByEmail(service, email) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 100) return null;
  }
  throw new Error("Auth user search exceeded the staging pagination limit.");
}
