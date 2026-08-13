-- Fictional / demo data only. Do not use as real member records.
-- Demo password for all seed accounts: DemoPassword123!

create extension if not exists pgcrypto;

insert into public.teams (id, name, telegram_url)
values ('11111111-1111-4111-8111-111111111111', 'Team Bravo', 'https://t.me/')
on conflict (name) do nothing;

insert into public.ranks (id, code, name, full_name, phase, eyebrow, pin_label, opens_text, officer_title, abbr, sort_order, citation, metal, insignia_kind, insignia_count)
values
  ('a1000000-0000-4000-8000-000000000001', 'BASE', 'BASE', 'Base Activation', 'Member', 'Activation', 'activated', 'My Team opens.', null, null, 1, 'As an activated member of the Gutguard Lifestyle, having completed Admin and Compliance and all five activation events.', 'bronze', 'seal', 0),
  ('a1000000-0000-4000-8000-000000000002', 'TL', 'TL', 'Team Leader', 'Lead Generator', 'Rank certification', 'pinned Team Leader', 'You''ll be invited to a Recognition Night.', 'Academy Second Lieutenant', '2Lt', 2, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Team Leader course and demonstrated them in the field.', 'silver', 'bars', 1),
  ('a1000000-0000-4000-8000-000000000003', 'SL', 'SL', 'Squad Leader', 'Presenter', 'Rank certification', 'pinned Squad Leader', 'You''ll be invited to a Recognition Night.', 'Academy First Lieutenant', '1Lt', 3, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Squad Leader course and presented before a room.', 'silver', 'bars', 2),
  ('a1000000-0000-4000-8000-000000000004', 'PL', 'PL', 'Platoon Leader', 'Trains Team Leaders', 'Rank certification', 'pinned Platoon Leader', 'You''ll be invited to a Recognition Night.', 'Academy Captain', 'Capt', 4, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Platoon Leader course and trained a Team Leader through to certification.', 'silver', 'bars', 3),
  ('a1000000-0000-4000-8000-000000000005', 'CC', 'CC', 'Company Commander', 'Trains Squad Leaders', 'Rank certification', 'pinned Company Commander', 'You''ll be invited to a Recognition Night.', 'Academy Major', 'Maj', 5, 'As an official member of the Gutguard Corps of Officers, having passed all training requirements of the Company Commander course and trained a Squad Leader through to certification.', 'gold', 'field', 1)
on conflict (code) do nothing;

insert into public.training_documents (id, slug, title, title_tl, version, minutes, blurb, blurb_tl, body, body_tl)
values
  ('d1000000-0000-4000-8000-000000000001', 'dashboard-orientation', 'Gutguard Dashboard Orientation', 'Orientation ng Dashboard', 'v1.0', '4 min', 'Where everything lives — content, sales, your team.', 'Dito nakalagay ang lahat — content, sales, at ang team mo.', 'This short orientation shows where content, sales, and your team live in the dashboard. Watch it once, then continue.', 'Ipinapakita ng maikling orientation na ito kung nasaan ang content, sales, at ang team mo. Panoorin minsan, tapos magpatuloy.'),
  ('d1000000-0000-4000-8000-000000000002', 'distributors-agreement', 'Distributor''s Agreement', 'Kasunduan ng Distributor', 'v3.1', '6 min', 'What you''re agreeing to, in plain terms.', 'Ang pinapasukan mo, sa simpleng salita.', 'This Agreement is between Gutguard Philippines Inc. and you as an independent distributor. You are not an employee. You earn from product sold, never from recruitment alone. You may not make medical claims about any product. You may not require anyone below you to purchase stock. Either party may end this Agreement in writing at any time. Your card number and downline records remain the property of the company.', 'Ang kasunduang ito ay sa pagitan ng Gutguard Philippines Inc. at ikaw bilang isang independent distributor. Hindi ka empleyado. Kumikita ka mula sa produktong nabenta, hindi mula sa pagre-recruit lamang. Bawal kang mag-claim ng anumang medikal na epekto ng produkto. Bawal mong pilitin ang sinumang nasa ilalim mo na bumili ng stock. Maaaring wakasan ninuman sa atin ang kasunduang ito sa pamamagitan ng sulat, anumang oras. Ang card number mo at ang talaan ng iyong downline ay pag-aari ng kompanya.'),
  ('d1000000-0000-4000-8000-000000000003', 'code-of-ethics', 'Code of Ethics', 'Kodigo ng Etika', 'v2.0', '5 min', 'How we speak about the product, and about each other.', 'Kung paano tayo magsalita tungkol sa produkto, at sa isa''t isa.', 'Speak only to what the product is: food, taken daily. Never promise a cure, never diagnose, never discourage anyone from seeing a doctor. Show real testimonies with the person''s consent and never edit them into a claim. Do not poach another distributor''s prospect. Do not sell below the posted price. Do not present income as guaranteed, and never show earnings without showing the work behind them.', 'Sabihin lamang kung ano talaga ang produkto: pagkain, iniinom araw-araw. Huwag mangakong may lunas, huwag mag-diagnose, at huwag pigilan ang sinuman na magpatingin sa doktor. Ipakita lamang ang totoong testimonya nang may pahintulot, at huwag itong baguhin para maging claim. Huwag agawin ang prospect ng ibang distributor. Huwag magbenta nang mas mababa sa nakatakdang presyo. Huwag sabihing garantisado ang kita.'),
  ('d1000000-0000-4000-8000-000000000004', 'gentrep-creed', 'Gentrep Creed', 'Ang Gentrep Creed', 'v1.0', '2 min', 'What we hold ourselves to.', 'Ang pinanghahawakan natin sa sarili.', 'I earn, I do not extract. I bring people in only when I would want to be brought in the same way. I tell the truth about the product, the money, and the work. I do not leave someone I signed up to figure it out alone. What I build should still stand if I stop building it.', 'Kumikita ako, hindi ako nangungurakot. Isinasama ko lang ang tao kung paano ko rin gustong isama ako. Sinasabi ko ang totoo tungkol sa produkto, sa pera, at sa trabaho. Hindi ko iiwan ang taong isinama ko. Ang itinatayo ko ay dapat tumayo pa rin kahit tumigil na ako.')
on conflict (slug) do nothing;

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
on conflict (code) do nothing;

insert into public.training_events (id, title, event_type, starts_at, venue, host_name, host_rank_code, capacity, status, is_demo)
values
  ('e1000000-0000-4000-8000-000000000011', 'Testimonial Session', 'Testimonial Session', '2026-08-02 14:00:00+08', 'Robinsons, Davao', 'Jesh M. (demo)', 'CC', 4, 'completed', true),
  ('e1000000-0000-4000-8000-000000000012', 'Product Presentation', 'Product Presentation', '2026-08-02 16:00:00+08', 'Lagao Hall', 'Ana R. (demo)', 'PL', 15, 'completed', true),
  ('e1000000-0000-4000-8000-000000000013', 'Business Orientation', 'Business Orientation', '2026-08-03 15:00:00+08', 'Koronadal', 'Rey T. (demo)', 'PL', 22, 'completed', true),
  ('e1000000-0000-4000-8000-000000000014', 'Testimonial Session', 'Testimonial Session', '2026-08-09 14:00:00+08', 'Lagao Hall', 'Ana R. (demo)', 'PL', 0, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000015', 'Ginhawa Talk', 'Ginhawa Talk', '2026-08-09 09:00:00+08', 'Polomolok', 'Ana R. (demo)', 'PL', 30, 'completed', true),
  ('e1000000-0000-4000-8000-000000000016', 'Business Orientation', 'Business Orientation', '2026-08-23 16:00:00+08', 'Lagao Hall', 'Ana R. (demo)', 'PL', 9, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000017', 'Leaders'' Training', 'Leaders'' Training', '2026-08-23 13:00:00+08', 'Robinsons, Davao', 'Rey T. (demo)', 'PL', 8, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000018', 'Ginhawa Talk', 'Ginhawa Talk', '2026-08-30 09:00:00+08', 'Koronadal', 'Jesh M. (demo)', 'CC', 20, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000019', 'Leaders'' Training', 'Leaders'' Training', '2026-08-30 13:00:00+08', 'Lagao Hall', 'Ana R. (demo)', 'PL', 10, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000021', 'Your First Twenty Names', 'Your First Twenty Names', '2026-08-23 13:00:00+08', 'Koronadal', 'Ana R. (demo)', 'PL', 8, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000022', 'The Invite Conversation', 'The Invite Conversation', '2026-08-30 14:00:00+08', 'Polomolok', 'Jesh M. (demo)', 'CC', 25, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000023', 'Following Up', 'Following Up', '2026-09-06 13:00:00+08', 'Lagao Hall', 'Rey T. (demo)', 'PL', 16, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000024', 'Handling a Guest', 'Handling a Guest', '2026-09-13 10:00:00+08', 'Koronadal', 'Ana R. (demo)', 'PL', 12, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000025', 'What You May Not Say', 'What You May Not Say', '2026-09-20 09:00:00+08', 'Lagao Hall', 'Jesh M. (demo)', 'CC', 30, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000031', 'Opening a Room', 'Opening a Room', '2026-09-06 13:00:00+08', 'Lagao Hall', 'Jesh M. (demo)', 'CC', 14, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000032', 'The Product Story', 'The Product Story', '2026-09-13 13:00:00+08', 'Koronadal', 'Rey T. (demo)', 'PL', 18, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000101', 'Testimonial Session', 'Testimonial Session', '2026-08-23 14:00:00+08', 'Robinsons, Davao', 'Jesh M. (demo)', 'CC', 4, 'scheduled', true),
  ('e1000000-0000-4000-8000-000000000102', 'Product Presentation', 'Product Presentation', '2026-08-30 16:00:00+08', 'Lagao Hall', 'Ana R. (demo)', 'PL', 15, 'scheduled', true)
on conflict (id) do nothing;

-- Demo auth users. Password: DemoPassword123!
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'demo.member@gentrep.academy', crypt('DemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rey Aquino (demo)"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'demo.staff@gentrep.academy', crypt('DemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Reyes (demo staff)"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'demo.trainer@gentrep.academy', crypt('DemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rey Torralba (demo trainer)"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'demo.admin@gentrep.academy', crypt('DemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Academy Admin (demo)"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', '{"sub":"00000000-0000-4000-8000-000000000001","email":"demo.member@gentrep.academy"}', 'email', '00000000-0000-4000-8000-000000000001', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000002', '{"sub":"00000000-0000-4000-8000-000000000002","email":"demo.staff@gentrep.academy"}', 'email', '00000000-0000-4000-8000-000000000002', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000003', '{"sub":"00000000-0000-4000-8000-000000000003","email":"demo.trainer@gentrep.academy"}', 'email', '00000000-0000-4000-8000-000000000003', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000004', '{"sub":"00000000-0000-4000-8000-000000000004","email":"demo.admin@gentrep.academy"}', 'email', '00000000-0000-4000-8000-000000000004', now(), now(), now())
on conflict do nothing;

update public.profiles
set
  full_name = 'Rey Aquino (demo)',
  member_card = '0240 5578 9012 3456',
  team_id = '11111111-1111-4111-8111-111111111111',
  current_rank_id = 'a1000000-0000-4000-8000-000000000001',
  is_demo = true
where id = '00000000-0000-4000-8000-000000000001';

update public.profiles
set full_name = 'Ana Reyes (demo staff)', is_demo = true, current_rank_id = 'a1000000-0000-4000-8000-000000000004'
where id = '00000000-0000-4000-8000-000000000002';

update public.profiles
set full_name = 'Rey Torralba (demo trainer)', is_demo = true, current_rank_id = 'a1000000-0000-4000-8000-000000000004'
where id = '00000000-0000-4000-8000-000000000003';

update public.profiles
set full_name = 'Academy Admin (demo)', is_demo = true, current_rank_id = 'a1000000-0000-4000-8000-000000000005'
where id = '00000000-0000-4000-8000-000000000004';

insert into public.user_roles (user_id, role) values
  ('00000000-0000-4000-8000-000000000001', 'member'),
  ('00000000-0000-4000-8000-000000000002', 'member'),
  ('00000000-0000-4000-8000-000000000002', 'staff'),
  ('00000000-0000-4000-8000-000000000003', 'member'),
  ('00000000-0000-4000-8000-000000000003', 'trainer'),
  ('00000000-0000-4000-8000-000000000004', 'member'),
  ('00000000-0000-4000-8000-000000000004', 'admin')
on conflict do nothing;

insert into public.team_members (team_id, user_id)
values ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000001')
on conflict do nothing;

insert into public.trainer_assignments (trainer_id, member_id)
values ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001')
on conflict do nothing;

insert into public.event_staff (event_id, user_id)
select id, '00000000-0000-4000-8000-000000000002' from public.training_events
on conflict do nothing;

-- Prototype-equivalent progress for the demo member (fictional).
insert into public.requirement_completions (user_id, requirement_id, status, completed_at, source, language, evidence)
values
  ('00000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'done', '2026-07-28 10:00:00+08', 'document', 'en', '{}'),
  ('00000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'done', '2026-07-28 10:20:00+08', 'document', 'en', '{}'),
  ('00000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'done', '2026-07-28 10:40:00+08', 'document', 'tl', '{}'),
  ('00000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', 'done', '2026-07-19 09:00:00+08', 'attendance', null, '{}'),
  ('00000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'missed', null, 'attendance', null, '{}')
on conflict (user_id, requirement_id) do nothing;

insert into public.document_acceptances (user_id, document_id, document_version, language, requirement_id, accepted_at)
values
  ('00000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'v1.0', 'en', 'b1000000-0000-4000-8000-000000000001', '2026-07-28 10:00:00+08'),
  ('00000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'v3.1', 'en', 'b1000000-0000-4000-8000-000000000002', '2026-07-28 10:20:00+08'),
  ('00000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'v2.0', 'tl', 'b1000000-0000-4000-8000-000000000003', '2026-07-28 10:40:00+08')
on conflict do nothing;
