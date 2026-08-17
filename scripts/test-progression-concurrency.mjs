import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const container = process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_gentrep-academy";
const memberId = "90000000-0000-4000-8000-000000000001";
const baseRankId = "a1000000-0000-4000-8000-000000000001";
const finalRequirementId = "b1000000-0000-4000-8000-000000000009";

function psql(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      container,
      "psql",
      "-X",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-At",
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

async function psqlAsync(sql) {
  return execFileAsync(
    "docker",
    [
      "exec",
      container,
      "psql",
      "-X",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-At",
      "-c",
      sql,
    ],
    { encoding: "utf8", windowsHide: true },
  );
}

function cleanup() {
  psql(`
    delete from public.audit_log
    where entity_id = '${memberId}'::uuid
       or entity_id in (select id from public.certificates where user_id = '${memberId}'::uuid);
    delete from auth.users where id = '${memberId}'::uuid and email = 'concurrency@gentrep.test';
  `);
}

try {
  psql("select 1");
} catch {
  console.error(`Local Supabase database container ${container} is not available.`);
  process.exit(1);
}

try {
  cleanup();
  psql(`
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', '${memberId}',
      'authenticated', 'authenticated', 'concurrency@gentrep.test', '', now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"[TEST] Concurrent Member"}', now(), now(), '', '', '', ''
    );
    update public.profiles
    set full_name = '[TEST] Concurrent Member', is_demo = true
    where id = '${memberId}'::uuid;
    insert into public.requirement_completions
      (user_id, requirement_id, status, completed_at, source, evidence)
    select '${memberId}'::uuid, id, 'done', now(), '[TEST] concurrency', '{"test_fixture":true}'::jsonb
    from public.requirements
    where rank_id = '${baseRankId}'::uuid and id <> '${finalRequirementId}'::uuid;
  `);

  const finalWrite = `
    insert into public.requirement_completions
      (user_id, requirement_id, status, completed_at, source, evidence)
    values (
      '${memberId}'::uuid, '${finalRequirementId}'::uuid, 'done', now(),
      '[TEST] concurrency', '{"test_fixture":true}'::jsonb
    )
    on conflict (user_id, requirement_id) do update
      set status = 'done', completed_at = excluded.completed_at,
          source = excluded.source, evidence = excluded.evidence;
  `;

  await Promise.all([psqlAsync(finalWrite), psqlAsync(finalWrite)]);

  const result = psql(`
    select json_build_object(
      'certificates', (select count(*) from public.certificates where user_id = '${memberId}'::uuid and rank_id = '${baseRankId}'::uuid),
      'complete_progress', (select count(*) from public.member_rank_progress where user_id = '${memberId}'::uuid and rank_id = '${baseRankId}'::uuid and status = 'complete'),
      'issuance_audits', (select count(*) from public.audit_log where action = 'certificate.issued' and entity_id in (select id from public.certificates where user_id = '${memberId}'::uuid))
    );
  `);
  const counts = JSON.parse(result);

  if (counts.certificates !== 1 || counts.complete_progress !== 1 || counts.issuance_audits !== 1) {
    throw new Error(`Concurrency invariant failed: ${result}`);
  }

  console.log("Concurrent completion test passed: one rank completion and one certificate.");
} finally {
  cleanup();
}
