begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions, pgtap;

select extensions.plan(61);
set local role postgres;

create function pg_temp.visible_row_count(p_sql text)
returns bigint
language plpgsql
as $$
declare
  v_count bigint;
begin
  execute p_sql into v_count;
  return v_count;
exception
  when insufficient_privilege then return 0;
end;
$$;

select has_table('public', 'trainer_credits', 'trainer credit ledger exists');
select has_column('public', 'certificates', 'verification_code', 'certificates have public verification codes');
select has_index('public', 'certificates', 'certificates_verification_code_unique', 'verification codes have a unique index');
select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'profiles', 'user_roles', 'team_members', 'training_documents', 'requirements',
        'member_rank_progress', 'document_acceptances', 'training_events', 'event_staff',
        'trainer_assignments', 'event_bookings', 'attendance_records', 'requirement_completions',
        'trainer_verifications', 'certificates', 'trainer_credits', 'audit_log'
      )
      and not c.relrowsecurity
  ),
  'RLS is enabled on every user-facing or authorization table'
);
select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'academy'
      and p.prosecdef
      and not coalesce(p.proconfig, '{}'::text[]) @> array['search_path=pg_catalog, public']
      and not coalesce(p.proconfig, '{}'::text[]) @> array['search_path=pg_catalog, public, extensions']
  ),
  'all academy SECURITY DEFINER functions pin search_path'
);

select is((select count(*) from public.profiles where is_demo), 19::bigint, 'seed has 19 synthetic profiles');
select is((select count(*) from public.user_roles where role = 'staff'), 2::bigint, 'seed has two staff');
select is((select count(*) from public.user_roles where role = 'trainer'), 3::bigint, 'seed has three trainers');
select is((select count(*) from public.user_roles where role = 'member'), 14::bigint, 'seed has fourteen members');
select is(
  (select count(*) from (select user_id from public.user_roles group by user_id having count(*) <> 1) invalid),
  0::bigint,
  'every synthetic identity has exactly one role'
);
select is((select count(*) from public.certificates), 3::bigint, 'seed produces the expected three certificates');
select is(
  (select count(distinct verification_code) from public.certificates),
  (select count(*) from public.certificates),
  'certificate verification codes are unique'
);
select is((select count(*) from public.trainer_credits), 1::bigint, 'one historical trainer credit is present');
select is(
  (select primary_trainer_id from public.trainer_credits limit 1),
  '10000000-0000-4000-8000-000000000201'::uuid,
  'credit is attributed to the primary trainer at completion time'
);
select is(
  (
    select trainer_id
    from public.trainer_assignments
    where member_id = '10000000-0000-4000-8000-000000000303'
      and assignment_kind = 'primary' and ended_at is null
  ),
  '10000000-0000-4000-8000-000000000202'::uuid,
  'later reassignment changes the active primary trainer only'
);

select set_config(
  'test.certificate_code',
  (select verification_code from public.certificates where user_id = '10000000-0000-4000-8000-000000000301'),
  true
);

set local role anon;
select extensions.is(pg_temp.visible_row_count('select count(*) from public.profiles'), 0::bigint, 'anonymous visitors cannot read profiles');
select extensions.is(pg_temp.visible_row_count('select count(*) from public.training_events'), 0::bigint, 'anonymous visitors cannot read events');
select is(
  (select count(*) from public.verify_certificate(current_setting('test.certificate_code'))),
  1::bigint,
  'anonymous visitors can verify a certificate by opaque code'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000302', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.profiles), 1::bigint, 'member can read their own profile');
select is(
  (select count(*) from public.profiles where id = '10000000-0000-4000-8000-000000000303'),
  0::bigint,
  'member cannot read another member profile'
);
select is(
  (select count(*) from public.training_events where id in ('e1000000-0000-4000-8000-000000000201', 'e1000000-0000-4000-8000-000000000202')),
  2::bigint,
  'member can read the event roadmap'
);
select is(
  academy.can_access_rank('10000000-0000-4000-8000-000000000302', 'a1000000-0000-4000-8000-000000000002'),
  false,
  'next rank remains locked while the prior rank is incomplete'
);
select is(
  academy.can_access_rank('10000000-0000-4000-8000-000000000303', 'a1000000-0000-4000-8000-000000000003'),
  true,
  'next sequential rank unlocks after prior completion'
);
select throws_ok(
  $$select public.issue_certificate('10000000-0000-4000-8000-000000000302', 'a1000000-0000-4000-8000-000000000002')$$,
  'P0001',
  'Sequential rank prerequisites are not complete.',
  'direct RPC cannot skip a rank'
);
select throws_ok(
  $$select public.set_user_role('10000000-0000-4000-8000-000000000302', 'admin')$$,
  'P0001',
  'Administrator role required',
  'member cannot elevate their own role through RPC'
);
select throws_matching(
  $$insert into public.user_roles (user_id, role) values ('10000000-0000-4000-8000-000000000302', 'admin')$$,
  '(permission denied|row-level security)',
  'member cannot elevate their own role through direct DML'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000101', true);
set local role authenticated;
select is(
  (select count(*) from public.training_events where id in ('e1000000-0000-4000-8000-000000000201', 'e1000000-0000-4000-8000-000000000202')),
  1::bigint,
  'assigned staff sees only their assigned fixture event'
);
select is(
  (select count(*) from public.profiles where id in ('10000000-0000-4000-8000-000000000304', '10000000-0000-4000-8000-000000000305', '10000000-0000-4000-8000-000000000306')),
  2::bigint,
  'assigned staff sees only members booked into their event'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000102', true);
set local role authenticated;
select is(
  (select count(*) from public.training_events where id in ('e1000000-0000-4000-8000-000000000201', 'e1000000-0000-4000-8000-000000000202')),
  1::bigint,
  'other staff sees only their own assigned fixture event'
);
select is(
  (select count(*) from public.profiles where id in ('10000000-0000-4000-8000-000000000304', '10000000-0000-4000-8000-000000000305', '10000000-0000-4000-8000-000000000306')),
  1::bigint,
  'other staff cannot read members from an unassigned event'
);
select throws_ok(
  $$select public.record_attendance('f1000000-0000-4000-8000-000000000301', 'attended', '[TEST] unauthorized attempt')$$,
  'P0001',
  'Staff assignment required',
  'unassigned staff cannot record attendance'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000101', true);
set local role authenticated;
select lives_ok(
  $$select public.record_attendance('f1000000-0000-4000-8000-000000000301', 'attended', '[TEST] authorized')$$,
  'assigned staff can record attendance'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000201', true);
set local role authenticated;
select is(
  (select count(*) from public.profiles where id = '10000000-0000-4000-8000-000000000303'),
  0::bigint,
  'ended primary trainer cannot retain member access'
);
select is(
  (select count(*) from public.trainer_assignments where member_id = '10000000-0000-4000-8000-000000000303'),
  0::bigint,
  'ended primary trainer cannot read the historical assignment row'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000202', true);
set local role authenticated;
select is(
  (select count(*) from public.profiles where id in ('10000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000304')),
  2::bigint,
  'active primary trainer sees assigned members'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000203', true);
set local role authenticated;
select is(
  (select count(*) from public.profiles where id = '10000000-0000-4000-8000-000000000303'),
  1::bigint,
  'active mentor sees their assigned member'
);
select is(
  (select count(*) from public.profiles where id = '10000000-0000-4000-8000-000000000304'),
  0::bigint,
  'mentor cannot see an unassigned member'
);
select throws_ok(
  $$select public.verify_demonstration('10000000-0000-4000-8000-000000000304', 'b1000000-0000-4000-8000-000000000016', 'confirmed', '[TEST] unauthorized attempt')$$,
  'P0001',
  'Trainer assignment required',
  'unassigned trainer cannot verify a demonstration'
);

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000303', true);
set local role authenticated;
select is(
  (public.issue_certificate('10000000-0000-4000-8000-000000000303', 'a1000000-0000-4000-8000-000000000002')->>'id')::uuid,
  (select id from public.certificates where user_id = '10000000-0000-4000-8000-000000000303' and rank_id = 'a1000000-0000-4000-8000-000000000002'),
  'repeated completion returns the newly completed rank certificate'
);
select is(
  (select count(*) from public.certificates where user_id = '10000000-0000-4000-8000-000000000303' and rank_id = 'a1000000-0000-4000-8000-000000000002'),
  1::bigint,
  'repeated completion does not duplicate a certificate'
);

set local role postgres;
delete from public.user_roles where user_id = '10000000-0000-4000-8000-000000000102';
insert into public.user_roles (user_id, role) values ('10000000-0000-4000-8000-000000000102', 'admin');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000102', true);
set local role authenticated;
select is((select count(*) from public.profiles where is_demo), 19::bigint, 'administrator can read every synthetic profile');
select is(
  (select count(*) from public.training_events where id in ('e1000000-0000-4000-8000-000000000201', 'e1000000-0000-4000-8000-000000000202')),
  2::bigint,
  'administrator can read all events'
);
select is(
  public.set_user_role('10000000-0000-4000-8000-000000000314', 'trainer')->>'role',
  'trainer',
  'administrator can assign an application role through the audited RPC'
);
select is((select count(*) from public.user_roles where user_id = '10000000-0000-4000-8000-000000000314'), 1::bigint, 'role RPC preserves exactly one role');
select is((select role::text from public.user_roles where user_id = '10000000-0000-4000-8000-000000000314'), 'trainer', 'role RPC stores the requested authoritative role');
select is(
  (select count(*) from public.audit_log where action = 'role.assigned' and entity_id = '10000000-0000-4000-8000-000000000314'),
  1::bigint,
  'role assignment is audited'
);

select set_config(
  'test.old_certificate_code',
  (select verification_code from public.certificates where user_id = '10000000-0000-4000-8000-000000000301'),
  true
);
select is(
  public.revoke_certificate(
    (select id from public.certificates where user_id = '10000000-0000-4000-8000-000000000301'),
    '[TEST] lifecycle test'
  )->>'status',
  'revoked',
  'administrator can revoke a certificate through the audited RPC'
);
select is(
  (select status::text from public.certificates where user_id = '10000000-0000-4000-8000-000000000301'),
  'revoked',
  'revocation persists authoritative certificate status'
);
select is(
  (select status::text from public.verify_certificate(current_setting('test.old_certificate_code'))),
  'revoked',
  'public verification reports a revoked certificate honestly'
);
select lives_ok(
  $$select public.reissue_certificate((select id from public.certificates where user_id = '10000000-0000-4000-8000-000000000301'), '[TEST] lifecycle test')$$,
  'administrator can reissue a revoked certificate'
);
select isnt(
  (select verification_code from public.certificates where user_id = '10000000-0000-4000-8000-000000000301'),
  current_setting('test.old_certificate_code'),
  'reissue rotates the opaque verification code'
);
select is((select count(*) from public.verify_certificate(current_setting('test.old_certificate_code'))), 0::bigint, 'old verification code stops resolving after reissue');
select is(
  (
    select status::text
    from public.verify_certificate(
      (select verification_code from public.certificates where user_id = '10000000-0000-4000-8000-000000000301')
    )
  ),
  'issued',
  'new verification code resolves the reissued certificate'
);

select is(
  public.correct_trainer_credit(
    (select id from public.trainer_credits limit 1),
    '10000000-0000-4000-8000-000000000203',
    '[TEST] correction lifecycle'
  )->>'primary_trainer_id',
  '10000000-0000-4000-8000-000000000203',
  'administrator can correct historical credit through an audited RPC'
);
select is(
  (select primary_trainer_id from public.trainer_credits limit 1),
  '10000000-0000-4000-8000-000000000203'::uuid,
  'credit correction updates the ledger recipient'
);
select is((select count(*) from public.audit_log where action = 'trainer_credit.corrected'), 1::bigint, 'credit correction is audited');
select is(has_function_privilege('anon', 'public.set_user_role(uuid,public.app_role)', 'EXECUTE'), false, 'anonymous role cannot execute role administration');
select is(has_function_privilege('anon', 'public.verify_certificate(text)', 'EXECUTE'), true, 'anonymous role can execute certificate verification');
select is(has_function_privilege('anon', 'academy.issue_certificate(uuid,uuid)', 'EXECUTE'), false, 'anonymous role cannot execute certificate issuance');
select is(has_function_privilege('authenticated', 'public.bootstrap_staging_admin(uuid)', 'EXECUTE'), false, 'authenticated users cannot execute staging admin bootstrap');
select is(has_function_privilege('service_role', 'public.bootstrap_staging_admin(uuid)', 'EXECUTE'), true, 'service role alone can execute staging admin bootstrap');

select * from extensions.finish();
rollback;
