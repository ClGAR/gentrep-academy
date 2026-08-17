-- Removes only deterministic [TEST] staging fixtures.
-- The shared catalog in seed.sql and the invited admin account are preserved.

do $$
begin
  if exists (
    select 1
    from auth.users
    where id::text like '10000000-0000-4000-8000-000000000%'
      and email not like '%@gentrep.test'
  ) then
    raise exception 'Cleanup stopped: a reserved fixture ID is attached to a non-test email.';
  end if;
end;
$$;

delete from public.audit_log
where actor_id::text like '10000000-0000-4000-8000-000000000%'
   or metadata->>'test_fixture' = 'true';

delete from public.trainer_credits
where member_id::text like '10000000-0000-4000-8000-000000000%'
   or primary_trainer_id::text like '10000000-0000-4000-8000-000000000%';

delete from public.attendance_records
where user_id::text like '10000000-0000-4000-8000-000000000%'
   or recorded_by::text like '10000000-0000-4000-8000-000000000%';

delete from auth.users
where id::text like '10000000-0000-4000-8000-000000000%'
  and email like '%@gentrep.test';

delete from public.training_events
where id in (
  'e1000000-0000-4000-8000-000000000201',
  'e1000000-0000-4000-8000-000000000202'
)
and is_demo = true
and title like '[TEST]%';
