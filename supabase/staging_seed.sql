-- Deterministic, synthetic staging fixtures. Every person and event is marked [TEST].
-- These identities have no password and cannot be used for interactive sign-in.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000101', 'authenticated', 'authenticated', 'staff01@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Staff 01"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000102', 'authenticated', 'authenticated', 'staff02@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Staff 02"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000201', 'authenticated', 'authenticated', 'trainer01@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Trainer 01"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000202', 'authenticated', 'authenticated', 'trainer02@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Trainer 02"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000203', 'authenticated', 'authenticated', 'trainer03@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Trainer 03"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000301', 'authenticated', 'authenticated', 'member01@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 01"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000302', 'authenticated', 'authenticated', 'member02@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 02"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000303', 'authenticated', 'authenticated', 'member03@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 03"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000304', 'authenticated', 'authenticated', 'member04@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 04"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000305', 'authenticated', 'authenticated', 'member05@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 05"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000306', 'authenticated', 'authenticated', 'member06@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 06"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000307', 'authenticated', 'authenticated', 'member07@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 07"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000308', 'authenticated', 'authenticated', 'member08@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 08"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000309', 'authenticated', 'authenticated', 'member09@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 09"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000310', 'authenticated', 'authenticated', 'member10@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 10"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000311', 'authenticated', 'authenticated', 'member11@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 11"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000312', 'authenticated', 'authenticated', 'member12@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 12"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000313', 'authenticated', 'authenticated', 'member13@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 13"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000314', 'authenticated', 'authenticated', 'member14@gentrep.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"[TEST] Member 14"}', now(), now(), '', '', '', '')
on conflict (id) do update set
  email = excluded.email,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

update public.profiles p
set
  full_name = u.raw_user_meta_data->>'full_name',
  member_card = 'TEST-' || right(u.id::text, 3),
  team_id = '11111111-1111-4111-8111-111111111111',
  is_demo = true
from auth.users u
where p.id = u.id
  and u.id::text like '10000000-0000-4000-8000-000000000%';

delete from public.user_roles
where user_id::text like '10000000-0000-4000-8000-000000000%';

insert into public.user_roles (user_id, role)
values
  ('10000000-0000-4000-8000-000000000101', 'staff'),
  ('10000000-0000-4000-8000-000000000102', 'staff'),
  ('10000000-0000-4000-8000-000000000201', 'trainer'),
  ('10000000-0000-4000-8000-000000000202', 'trainer'),
  ('10000000-0000-4000-8000-000000000203', 'trainer'),
  ('10000000-0000-4000-8000-000000000301', 'member'),
  ('10000000-0000-4000-8000-000000000302', 'member'),
  ('10000000-0000-4000-8000-000000000303', 'member'),
  ('10000000-0000-4000-8000-000000000304', 'member'),
  ('10000000-0000-4000-8000-000000000305', 'member'),
  ('10000000-0000-4000-8000-000000000306', 'member'),
  ('10000000-0000-4000-8000-000000000307', 'member'),
  ('10000000-0000-4000-8000-000000000308', 'member'),
  ('10000000-0000-4000-8000-000000000309', 'member'),
  ('10000000-0000-4000-8000-000000000310', 'member'),
  ('10000000-0000-4000-8000-000000000311', 'member'),
  ('10000000-0000-4000-8000-000000000312', 'member'),
  ('10000000-0000-4000-8000-000000000313', 'member'),
  ('10000000-0000-4000-8000-000000000314', 'member')
on conflict (user_id, role) do nothing;

insert into public.team_members (team_id, user_id)
select '11111111-1111-4111-8111-111111111111', id
from public.profiles
where id::text like '10000000-0000-4000-8000-000000000%'
on conflict (team_id, user_id) do nothing;

insert into public.training_events (id, title, event_type, starts_at, venue, host_name, capacity, status, is_demo)
values
  ('e1000000-0000-4000-8000-000000000201', '[TEST] Isolated Staff Event A', 'Business Orientation', '2026-09-27 10:00:00+08', '[TEST] Venue A', '[TEST] Staff 01', 1, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000202', '[TEST] Isolated Staff Event B', 'Product Presentation', '2026-09-28 10:00:00+08', '[TEST] Venue B', '[TEST] Staff 02', 2, 'scheduled', true)
on conflict (id) do update set
  title = excluded.title,
  starts_at = excluded.starts_at,
  venue = excluded.venue,
  host_name = excluded.host_name,
  capacity = excluded.capacity,
  status = excluded.status,
  is_demo = true;

insert into public.event_staff (event_id, user_id)
values
  ('e1000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000101'),
  ('e1000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000102')
on conflict (event_id, user_id) do nothing;

insert into public.trainer_assignments
  (trainer_id, member_id, assignment_kind, assigned_at, ended_at, assigned_by)
values
  ('10000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000303', 'primary', '2026-08-01 00:00:00+08', null, null),
  ('10000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000303', 'mentor', '2026-08-01 00:00:00+08', null, null),
  ('10000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000304', 'primary', '2026-08-01 00:00:00+08', null, null)
on conflict (trainer_id, member_id) do update set
  assignment_kind = excluded.assignment_kind,
  assigned_at = excluded.assigned_at,
  ended_at = coalesce(public.trainer_assignments.ended_at, excluded.ended_at);

insert into public.document_acceptances
  (user_id, document_id, document_version, language, requirement_id, accepted_at)
values
  ('10000000-0000-4000-8000-000000000302', 'd1000000-0000-4000-8000-000000000001', 'v1.0', 'en', 'b1000000-0000-4000-8000-000000000001', '2026-08-10 09:00:00+08'),
  ('10000000-0000-4000-8000-000000000302', 'd1000000-0000-4000-8000-000000000002', 'v3.1', 'tl', 'b1000000-0000-4000-8000-000000000002', '2026-08-10 09:05:00+08')
on conflict (user_id, document_id, document_version) do nothing;

insert into public.event_bookings
  (id, event_id, user_id, requirement_id, status, waitlist_position, created_at)
values
  ('f1000000-0000-4000-8000-000000000301', 'e1000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000304', 'b1000000-0000-4000-8000-000000000008', 'booked', null, '2026-08-11 09:00:00+08'),
  ('f1000000-0000-4000-8000-000000000302', 'e1000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000305', 'b1000000-0000-4000-8000-000000000008', 'waitlisted', 1, '2026-08-11 09:01:00+08'),
  ('f1000000-0000-4000-8000-000000000303', 'e1000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000306', 'b1000000-0000-4000-8000-000000000006', 'booked', null, '2026-08-11 09:02:00+08')
on conflict (id) do update set
  status = excluded.status,
  waitlist_position = excluded.waitlist_position;

update public.training_events set seats_taken = 1
where id in (
  'e1000000-0000-4000-8000-000000000201',
  'e1000000-0000-4000-8000-000000000202'
);

insert into public.attendance_records
  (booking_id, event_id, user_id, requirement_id, status, recorded_by, notes, recorded_at)
values
  ('f1000000-0000-4000-8000-000000000301', 'e1000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000304', 'b1000000-0000-4000-8000-000000000008', 'attended', '10000000-0000-4000-8000-000000000101', '[TEST] Attended', '2026-08-12 09:00:00+08'),
  ('f1000000-0000-4000-8000-000000000303', 'e1000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000306', 'b1000000-0000-4000-8000-000000000006', 'absent', '10000000-0000-4000-8000-000000000102', '[TEST] Absent', '2026-08-12 09:00:00+08')
on conflict (booking_id) do update set
  status = excluded.status,
  recorded_by = excluded.recorded_by,
  notes = excluded.notes,
  recorded_at = excluded.recorded_at;

insert into public.requirement_completions
  (user_id, requirement_id, status, completed_at, source, language, evidence)
select
  '10000000-0000-4000-8000-000000000301',
  r.id,
  'done',
  '2026-08-12 10:00:00+08',
  '[TEST] deterministic_seed',
  case when r.type = 'document' then 'en'::public.doc_language else null end,
  jsonb_build_object('test_fixture', true)
from public.requirements r
where r.rank_id = 'a1000000-0000-4000-8000-000000000001'
on conflict (user_id, requirement_id) do update set
  status = excluded.status,
  completed_at = excluded.completed_at,
  source = excluded.source,
  language = excluded.language,
  evidence = excluded.evidence;

insert into public.requirement_completions
  (user_id, requirement_id, status, completed_at, source, language, evidence)
select
  '10000000-0000-4000-8000-000000000303',
  r.id,
  'done',
  '2026-08-13 10:00:00+08',
  '[TEST] deterministic_seed',
  case when r.type = 'document' then 'en'::public.doc_language else null end,
  jsonb_build_object('test_fixture', true)
from public.requirements r
where r.rank_id = 'a1000000-0000-4000-8000-000000000001'
on conflict (user_id, requirement_id) do update set
  status = excluded.status,
  completed_at = excluded.completed_at,
  source = excluded.source,
  language = excluded.language,
  evidence = excluded.evidence;

insert into public.requirement_completions
  (user_id, requirement_id, status, completed_at, source, evidence)
select
  '10000000-0000-4000-8000-000000000303',
  r.id,
  'done',
  '2026-08-14 10:00:00+08',
  '[TEST] deterministic_seed',
  jsonb_build_object('test_fixture', true)
from public.requirements r
where r.rank_id = 'a1000000-0000-4000-8000-000000000002'
on conflict (user_id, requirement_id) do update set
  status = excluded.status,
  completed_at = excluded.completed_at,
  source = excluded.source,
  evidence = excluded.evidence;

update public.trainer_assignments
set ended_at = '2026-08-15 09:00:00+08'
where trainer_id = '10000000-0000-4000-8000-000000000201'
  and member_id = '10000000-0000-4000-8000-000000000303'
  and assignment_kind = 'primary';

insert into public.trainer_assignments
  (trainer_id, member_id, assignment_kind, assigned_at, ended_at, assigned_by)
values
  ('10000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000303', 'primary', '2026-08-15 09:01:00+08', null, null)
on conflict (trainer_id, member_id) do update set
  assignment_kind = excluded.assignment_kind,
  assigned_at = excluded.assigned_at,
  ended_at = excluded.ended_at;

insert into public.requirement_completions
  (user_id, requirement_id, status, completed_at, source, evidence)
values
  ('10000000-0000-4000-8000-000000000302', 'b1000000-0000-4000-8000-000000000001', 'done', '2026-08-10 09:00:00+08', '[TEST] deterministic_seed', '{"test_fixture":true}'),
  ('10000000-0000-4000-8000-000000000302', 'b1000000-0000-4000-8000-000000000002', 'done', '2026-08-10 09:05:00+08', '[TEST] deterministic_seed', '{"test_fixture":true}'),
  ('10000000-0000-4000-8000-000000000304', 'b1000000-0000-4000-8000-000000000008', 'done', '2026-08-12 09:00:00+08', '[TEST] attendance', '{"test_fixture":true}'),
  ('10000000-0000-4000-8000-000000000306', 'b1000000-0000-4000-8000-000000000006', 'missed', null, '[TEST] attendance', '{"test_fixture":true}')
on conflict (user_id, requirement_id) do update set
  status = excluded.status,
  completed_at = excluded.completed_at,
  source = excluded.source,
  evidence = excluded.evidence;
