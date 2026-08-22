-- Shared catalog data, plus development-only admin portal demo identities.
-- Synthetic staging identities (no password) live in staging_seed.sql.
-- Safe to rerun: stable IDs and conflict handling keep the catalog deterministic.
-- Never load demo portal passwords against production.

create extension if not exists pgcrypto;

insert into public.teams (id, name, telegram_url)
values ('11111111-1111-4111-8111-111111111111', 'Team Bravo', 'https://t.me/')
on conflict (name) do update
set telegram_url = excluded.telegram_url;

insert into public.ranks (id, code, name, full_name, phase, eyebrow, pin_label, opens_text, officer_title, abbr, sort_order, citation, metal, insignia_kind, insignia_count)
values
  ('a1000000-0000-4000-8000-000000000001', 'BASE', 'BASE', 'Base Activation', 'Member', 'Activation', 'activated', 'My Team opens.', null, null, 1, 'As an activated member of the Gutguard Lifestyle, having completed Admin and Compliance and all five activation events.', 'bronze', 'seal', 0),
  ('a1000000-0000-4000-8000-000000000002', 'TL', 'TL', 'Team Leader', 'Lead Generator', 'Rank certification', 'pinned Team Leader', 'You''ll be invited to a Recognition Night.', 'Academy Second Lieutenant', '2Lt', 2, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Team Leader course and demonstrated them in the field.', 'silver', 'bars', 1),
  ('a1000000-0000-4000-8000-000000000003', 'SL', 'SL', 'Squad Leader', 'Presenter', 'Rank certification', 'pinned Squad Leader', 'You''ll be invited to a Recognition Night.', 'Academy First Lieutenant', '1Lt', 3, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Squad Leader course and presented before a room.', 'silver', 'bars', 2),
  ('a1000000-0000-4000-8000-000000000004', 'PL', 'PL', 'Platoon Leader', 'Trains Team Leaders', 'Rank certification', 'pinned Platoon Leader', 'You''ll be invited to a Recognition Night.', 'Academy Captain', 'Capt', 4, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Platoon Leader course and trained a Team Leader through to certification.', 'silver', 'bars', 3),
  ('a1000000-0000-4000-8000-000000000005', 'CC', 'CC', 'Company Commander', 'Trains Squad Leaders', 'Rank certification', 'pinned Company Commander', 'You''ll be invited to a Recognition Night.', 'Academy Major', 'Maj', 5, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Company Commander course and trained a Squad Leader through to certification.', 'gold', 'field', 1)
on conflict (code) do update set
  name = excluded.name,
  full_name = excluded.full_name,
  phase = excluded.phase,
  eyebrow = excluded.eyebrow,
  pin_label = excluded.pin_label,
  opens_text = excluded.opens_text,
  officer_title = excluded.officer_title,
  abbr = excluded.abbr,
  sort_order = excluded.sort_order,
  citation = excluded.citation,
  metal = excluded.metal,
  insignia_kind = excluded.insignia_kind,
  insignia_count = excluded.insignia_count;

insert into public.training_documents (id, slug, title, title_tl, version, minutes, blurb, blurb_tl, body, body_tl)
values
  ('d1000000-0000-4000-8000-000000000001', 'dashboard-orientation', 'Gutguard Dashboard Orientation', 'Orientation ng Dashboard', 'v1.0', '4 min', 'Where everything lives — content, sales, your team.', 'Dito nakalagay ang lahat — content, sales, at ang team mo.', 'This short orientation shows where content, sales, and your team live in the dashboard. Watch it once, then continue.', 'Ipinapakita ng maikling orientation na ito kung nasaan ang content, sales, at ang team mo. Panoorin minsan, tapos magpatuloy.'),
  ('d1000000-0000-4000-8000-000000000002', 'distributors-agreement', 'Distributor''s Agreement', 'Kasunduan ng Distributor', 'v3.1', '6 min', 'What you''re agreeing to, in plain terms.', 'Ang pinapasukan mo, sa simpleng salita.', 'This Agreement is between Gutguard Philippines Inc. and you as an independent distributor. You are not an employee. You earn from product sold, never from recruitment alone. You may not make medical claims about any product. You may not require anyone below you to purchase stock. Either party may end this Agreement in writing at any time. Your card number and downline records remain the property of the company.', 'Ang kasunduang ito ay sa pagitan ng Gutguard Philippines Inc. at ikaw bilang isang independent distributor. Hindi ka empleyado. Kumikita ka mula sa produktong nabenta, hindi mula sa pagre-recruit lamang. Bawal kang mag-claim ng anumang medikal na epekto ng produkto. Bawal mong pilitin ang sinumang nasa ilalim mo na bumili ng stock. Maaaring wakasan ninuman sa atin ang kasunduang ito sa pamamagitan ng sulat, anumang oras. Ang card number mo at ang talaan ng iyong downline ay pag-aari ng kompanya.'),
  ('d1000000-0000-4000-8000-000000000003', 'code-of-ethics', 'Code of Ethics', 'Kodigo ng Etika', 'v2.0', '5 min', 'How we speak about the product, and about each other.', 'Kung paano tayo magsalita tungkol sa produkto, at sa isa''t isa.', 'Speak only to what the product is: food, taken daily. Never promise a cure, never diagnose, never discourage anyone from seeing a doctor. Show real testimonies with the person''s consent and never edit them into a claim. Do not poach another distributor''s prospect. Do not sell below the posted price. Do not present income as guaranteed, and never show earnings without showing the work behind them.', 'Sabihin lamang kung ano talaga ang produkto: pagkain, iniinom araw-araw. Huwag mangakong may lunas, huwag mag-diagnose, at huwag pigilan ang sinuman na magpatingin sa doktor. Ipakita lamang ang totoong testimonya nang may pahintulot, at huwag itong baguhin para maging claim. Huwag agawin ang prospect ng ibang distributor. Huwag magbenta nang mas mababa sa nakatakdang presyo. Huwag sabihing garantisado ang kita.'),
  ('d1000000-0000-4000-8000-000000000004', 'gentrep-creed', 'Gentrep Creed', 'Ang Gentrep Creed', 'v1.0', '2 min', 'What we hold ourselves to.', 'Ang pinanghahawakan natin sa sarili.', 'I earn, I do not extract. I bring people in only when I would want to be brought in the same way. I tell the truth about the product, the money, and the work. I do not leave someone I signed up to figure it out alone. What I build should still stand if I stop building it.', 'Kumikita ako, hindi ako nangungurakot. Isinasama ko lang ang tao kung paano ko rin gustong isama ako. Sinasabi ko ang totoo tungkol sa produkto, sa pera, at sa trabaho. Hindi ko iiwan ang taong isinama ko. Ang itinatayo ko ay dapat tumayo pa rin kahit tumigil na ako.')
on conflict (slug) do update set
  title = excluded.title,
  title_tl = excluded.title_tl,
  version = excluded.version,
  minutes = excluded.minutes,
  blurb = excluded.blurb,
  blurb_tl = excluded.blurb_tl,
  body = excluded.body,
  body_tl = excluded.body_tl;

insert into public.requirements (id, rank_id, code, type, title, note, minutes, sort_order, document_id)
values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'b-orient', 'document', 'Gutguard Dashboard Orientation', 'Where everything lives', '4 min', 1, 'd1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'b-da', 'document', 'Distributor''s Agreement', 'What you''re agreeing to', '6 min', 2, 'd1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'b-eth', 'document', 'Code of Ethics', 'How we speak', '5 min', 3, 'd1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'b-creed', 'document', 'Gentrep Creed', 'What we hold ourselves to', '2 min', 4, 'd1000000-0000-4000-8000-000000000004'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'b-1', 'attendance', 'Ginhawa Talk', 'Where it starts', null, 5, null),
  ('b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'b-2', 'attendance', 'Product Presentation', 'What it is, how to use it', null, 6, null),
  ('b1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'b-3', 'attendance', 'Testimonial Session', 'Real members, real results', null, 7, null),
  ('b1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'b-4', 'attendance', 'Business Orientation', 'How earning actually works', null, 8, null),
  ('b1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'b-5', 'attendance', 'Leaders'' Training', 'Running your own table', null, 9, null),
  ('b1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000002', 't-1', 'attendance', 'Your First Twenty Names', 'Where leads actually come from', null, 1, null),
  ('b1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000002', 't-2', 'attendance', 'The Invite Conversation', 'Asking without pressure', null, 2, null),
  ('b1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000002', 't-3', 'attendance', 'Following Up', 'Staying in touch, not chasing', null, 3, null),
  ('b1000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000002', 't-4', 'attendance', 'Handling a Guest', 'From the door to the seat', null, 4, null),
  ('b1000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000002', 't-5', 'attendance', 'What You May Not Say', 'Claims, income, and the line', null, 5, null),
  ('b1000000-0000-4000-8000-000000000016', 'a1000000-0000-4000-8000-000000000002', 't-demo', 'demonstration', 'Bring three guests', 'They check in, with a Platoon Leader in the room', null, 6, null),
  ('b1000000-0000-4000-8000-000000000021', 'a1000000-0000-4000-8000-000000000003', 's-1', 'attendance', 'Opening a Room', 'The first four minutes', null, 1, null),
  ('b1000000-0000-4000-8000-000000000022', 'a1000000-0000-4000-8000-000000000003', 's-2', 'attendance', 'The Product Story', 'What it is, without claims', null, 2, null),
  ('b1000000-0000-4000-8000-000000000023', 'a1000000-0000-4000-8000-000000000003', 's-3', 'attendance', 'Handling Questions', 'Including the hard ones', null, 3, null),
  ('b1000000-0000-4000-8000-000000000024', 'a1000000-0000-4000-8000-000000000003', 's-4', 'attendance', 'Closing the Session', 'Asking, and letting people choose', null, 4, null),
  ('b1000000-0000-4000-8000-000000000025', 'a1000000-0000-4000-8000-000000000003', 's-demo', 'demonstration', 'Present a full session', 'With a Platoon Leader watching', null, 5, null),
  ('b1000000-0000-4000-8000-000000000031', 'a1000000-0000-4000-8000-000000000004', 'p-1', 'attendance', 'Teaching, Not Telling', 'How adults actually learn', null, 1, null),
  ('b1000000-0000-4000-8000-000000000032', 'a1000000-0000-4000-8000-000000000004', 'p-2', 'attendance', 'Running a Class', 'Structure, pace, and the room', null, 2, null),
  ('b1000000-0000-4000-8000-000000000033', 'a1000000-0000-4000-8000-000000000004', 'p-3', 'attendance', 'Signing Someone Off', 'What you are vouching for', null, 3, null),
  ('b1000000-0000-4000-8000-000000000034', 'a1000000-0000-4000-8000-000000000004', 'p-der', 'derived', 'A Team Leader you trained is certified', 'Their certificate, not your word', null, 4, null),
  ('b1000000-0000-4000-8000-000000000041', 'a1000000-0000-4000-8000-000000000005', 'c-1', 'attendance', 'Building a Bench', 'Depth, not headcount', null, 1, null),
  ('b1000000-0000-4000-8000-000000000042', 'a1000000-0000-4000-8000-000000000005', 'c-2', 'attendance', 'Standards and Drift', 'Keeping the teaching true', null, 2, null),
  ('b1000000-0000-4000-8000-000000000043', 'a1000000-0000-4000-8000-000000000005', 'c-der', 'derived', 'A Squad Leader you trained is certified', 'Their certificate, not your word', null, 3, null)
on conflict (code) do update set
  rank_id = excluded.rank_id,
  type = excluded.type,
  title = excluded.title,
  note = excluded.note,
  minutes = excluded.minutes,
  sort_order = excluded.sort_order,
  document_id = excluded.document_id;

insert into public.training_events (id, title, event_type, starts_at, venue, host_name, host_rank_code, capacity, status, is_demo)
values
  ('e1000000-0000-4000-8000-000000000011', 'Testimonial Session', 'Testimonial Session', '2026-08-02 14:00:00+08', 'Robinsons, Davao', '[TEST] Host One', 'CC', 4, 'completed', true),
  ('e1000000-0000-4000-8000-000000000012', 'Product Presentation', 'Product Presentation', '2026-08-02 16:00:00+08', 'Lagao Hall', '[TEST] Host Two', 'PL', 15, 'completed', true),
  ('e1000000-0000-4000-8000-000000000013', 'Business Orientation', 'Business Orientation', '2026-08-03 15:00:00+08', 'Koronadal', '[TEST] Host Three', 'PL', 22, 'completed', true),
  ('e1000000-0000-4000-8000-000000000014', 'Testimonial Session', 'Testimonial Session', '2026-08-09 14:00:00+08', 'Lagao Hall', '[TEST] Host Two', 'PL', 0, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000015', 'Ginhawa Talk', 'Ginhawa Talk', '2026-08-09 09:00:00+08', 'Polomolok', '[TEST] Host Two', 'PL', 30, 'completed', true),
  ('e1000000-0000-4000-8000-000000000016', 'Business Orientation', 'Business Orientation', '2026-08-23 16:00:00+08', 'Lagao Hall', '[TEST] Host Two', 'PL', 9, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000017', 'Leaders'' Training', 'Leaders'' Training', '2026-08-23 13:00:00+08', 'Robinsons, Davao', '[TEST] Host Three', 'PL', 8, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000018', 'Ginhawa Talk', 'Ginhawa Talk', '2026-08-30 09:00:00+08', 'Koronadal', '[TEST] Host One', 'CC', 20, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000019', 'Leaders'' Training', 'Leaders'' Training', '2026-08-30 13:00:00+08', 'Lagao Hall', '[TEST] Host Two', 'PL', 10, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000021', 'Your First Twenty Names', 'Your First Twenty Names', '2026-08-23 13:00:00+08', 'Koronadal', '[TEST] Host Two', 'PL', 8, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000022', 'The Invite Conversation', 'The Invite Conversation', '2026-08-30 14:00:00+08', 'Polomolok', '[TEST] Host One', 'CC', 25, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000023', 'Following Up', 'Following Up', '2026-09-06 13:00:00+08', 'Lagao Hall', '[TEST] Host Three', 'PL', 16, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000024', 'Handling a Guest', 'Handling a Guest', '2026-09-13 10:00:00+08', 'Koronadal', '[TEST] Host Two', 'PL', 12, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000025', 'What You May Not Say', 'What You May Not Say', '2026-09-20 09:00:00+08', 'Lagao Hall', '[TEST] Host One', 'CC', 30, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000031', 'Opening a Room', 'Opening a Room', '2026-09-06 13:00:00+08', 'Lagao Hall', '[TEST] Host One', 'CC', 14, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000032', 'The Product Story', 'The Product Story', '2026-09-13 13:00:00+08', 'Koronadal', '[TEST] Host Three', 'PL', 18, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000101', 'Testimonial Session', 'Testimonial Session', '2026-08-23 14:00:00+08', 'Robinsons, Davao', '[TEST] Host One', 'CC', 4, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000102', 'Product Presentation', 'Product Presentation', '2026-08-30 16:00:00+08', 'Lagao Hall', '[TEST] Host Two', 'PL', 15, 'scheduled', true)
on conflict (id) do update set
  title = excluded.title,
  event_type = excluded.event_type,
  starts_at = excluded.starts_at,
  venue = excluded.venue,
  host_name = excluded.host_name,
  host_rank_code = excluded.host_rank_code,
  capacity = excluded.capacity,
  status = excluded.status,
  is_demo = true;

-- Development-only interactive accounts for /admin, /staff, /trainer, /academy.
-- Password for all: DemoPassword123!

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'demo.admin@gentrep.academy',
    extensions.crypt('DemoPassword123!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Super Admin"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'demo.clinician@gentrep.academy',
    extensions.crypt('DemoPassword123!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Clinician"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated', 'demo.support@gentrep.academy',
    extensions.crypt('DemoPassword123!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Support"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000004',
    'authenticated', 'authenticated', 'demo.staff@gentrep.academy',
    extensions.crypt('DemoPassword123!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Staff"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000005',
    'authenticated', 'authenticated', 'demo.trainer@gentrep.academy',
    extensions.crypt('DemoPassword123!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Trainer"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000006',
    'authenticated', 'authenticated', 'demo.member@gentrep.academy',
    extensions.crypt('DemoPassword123!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Member"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

do $ident$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  ) then
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    )
    select
      u.id,
      u.id,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email',
      u.id::text,
      now(),
      now(),
      now()
    from auth.users u
    where u.id in (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000003',
      '00000000-0000-4000-8000-000000000004',
      '00000000-0000-4000-8000-000000000005',
      '00000000-0000-4000-8000-000000000006'
    )
    on conflict do nothing;
  else
    insert into auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    select
      u.id,
      u.id,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    from auth.users u
    where u.id in (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000003',
      '00000000-0000-4000-8000-000000000004',
      '00000000-0000-4000-8000-000000000005',
      '00000000-0000-4000-8000-000000000006'
    )
    on conflict do nothing;
  end if;
end
$ident$;

update public.profiles p
set
  full_name = u.raw_user_meta_data->>'full_name',
  email = u.email,
  member_card = 'GG-' || right(u.id::text, 3),
  team_id = '11111111-1111-4111-8111-111111111111',
  account_status = 'active',
  is_demo = true
from auth.users u
where p.id = u.id
  and u.id in (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000006'
  );

insert into public.user_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000001', 'admin'),
  ('00000000-0000-4000-8000-000000000002', 'clinician'),
  ('00000000-0000-4000-8000-000000000003', 'support'),
  ('00000000-0000-4000-8000-000000000004', 'staff'),
  ('00000000-0000-4000-8000-000000000005', 'trainer')
on conflict (user_id, role) do nothing;

insert into public.team_members (team_id, user_id)
select '11111111-1111-4111-8111-111111111111', id
from public.profiles
where id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000005',
  '00000000-0000-4000-8000-000000000006'
)
on conflict (team_id, user_id) do nothing;

insert into public.clinician_assignments (clinician_id, member_id, status)
values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000006',
  'active'
)
on conflict (clinician_id, member_id) do update
set status = 'active', ended_at = null, assigned_at = now();

insert into public.staff_notes (id, subject_user_id, author_id, kind, body)
values
  (
    'a2000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000006',
    '00000000-0000-4000-8000-000000000002',
    'clinical',
    'Intake complete. Continue daily food, no medical claims in counselling.'
  ),
  (
    'a2000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000006',
    '00000000-0000-4000-8000-000000000003',
    'support',
    'Member asked how to reset a password. Pointed them to the invitation email.'
  )
on conflict (id) do update
set body = excluded.body, kind = excluded.kind, author_id = excluded.author_id;

insert into public.support_cases (id, member_id, opened_by, assignee_id, title, topic, status, priority)
values (
  'a2000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000006',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000003',
  'Card number not showing',
  'account',
  'open',
  'normal'
)
on conflict (id) do update
set title = excluded.title, topic = excluded.topic, status = excluded.status, priority = excluded.priority;

insert into public.cms_entries (
  id, collection_id, slug, title, excerpt, body, locale, status, clinical_review, version, published_at, published_by, updated_by
)
values
  (
    'e2000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000004',
    'hold-policy',
    'When to place an account hold',
    'Use a hold for access or identity issues, never for clinical disagreement.',
    'Place a hold when a member cannot be identified, or when access must pause. Lift the hold when the account is verified. Do not discuss clinical notes on this desk.',
    'en',
    'published',
    'not_required',
    1,
    now(),
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    'e2000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000001',
    'daily-food',
    'What we say about daily food',
    'Food taken daily. No cure language.',
    'Speak only to what the product is: food, taken daily. Never promise a cure, never diagnose, and never discourage anyone from seeing a doctor.',
    'en',
    'published',
    'not_required',
    1,
    now(),
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    'e2000000-0000-4000-8000-000000000003',
    'c1000000-0000-4000-8000-000000000002',
    'intake-protocol',
    'First-week intake protocol',
    'Waiting on dietitian review before it can go live.',
    'Week one: confirm daily intake, hydration, and that no medical claims were used in the invite conversation. Escalate clinical questions; do not invent protocol.',
    'en',
    'in_review',
    'pending',
    1,
    null,
    null,
    '00000000-0000-4000-8000-000000000002'
  ),
  (
    'e2000000-0000-4000-8000-000000000004',
    'c1000000-0000-4000-8000-000000000003',
    'product-claims-draft',
    'Product language (draft)',
    'Claims stay off the live site until Super Admin publishes an approved review.',
    'Draft only. Do not publish until a dietitian approves this copy. No disease or cure language.',
    'en',
    'draft',
    'pending',
    1,
    null,
    null,
    '00000000-0000-4000-8000-000000000001'
  )
on conflict (id) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  status = excluded.status,
  clinical_review = excluded.clinical_review,
  published_at = excluded.published_at,
  published_by = excluded.published_by,
  updated_by = excluded.updated_by;

insert into public.cms_revisions (id, entry_id, version, snapshot, editor_id)
select
  ('a2000000-0000-4000-8000-00000000002' || n)::uuid,
  e.id,
  e.version,
  to_jsonb(e),
  e.updated_by
from public.cms_entries e
join (values
  (1, 'e2000000-0000-4000-8000-000000000001'::uuid),
  (2, 'e2000000-0000-4000-8000-000000000002'::uuid),
  (3, 'e2000000-0000-4000-8000-000000000003'::uuid),
  (4, 'e2000000-0000-4000-8000-000000000004'::uuid)
) as x(n, id) on x.id = e.id
on conflict (entry_id, version) do update
set snapshot = excluded.snapshot, editor_id = excluded.editor_id;
