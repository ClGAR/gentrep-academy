-- Gentrep Academy initial schema, RLS, and booking RPCs.
-- Security-definer functions live in the unexposed `academy` schema.

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

create schema if not exists academy;
revoke all on schema academy from public;
grant usage on schema academy to postgres, service_role, authenticated, anon;

create type public.app_role as enum ('member', 'trainer', 'staff', 'admin');
create type public.requirement_type as enum ('document', 'attendance', 'demonstration', 'derived');
create type public.progress_status as enum ('open', 'booked', 'waitlisted', 'missed', 'done', 'rejected');
create type public.booking_status as enum ('booked', 'waitlisted', 'cancelled', 'attended', 'absent');
create type public.event_status as enum ('scheduled', 'cancelled', 'completed');
create type public.certificate_status as enum ('issued', 'revoked');
create type public.verification_status as enum ('pending', 'confirmed', 'rejected');
create type public.doc_language as enum ('en', 'tl');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  telegram_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ranks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  full_name text not null,
  phase text not null,
  eyebrow text not null,
  pin_label text not null,
  opens_text text not null,
  officer_title text,
  abbr text,
  sort_order integer not null unique,
  citation text not null,
  metal text not null check (metal in ('bronze', 'silver', 'gold')),
  insignia_kind text not null check (insignia_kind in ('seal', 'bars', 'field')),
  insignia_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  member_card text unique,
  team_id uuid references public.teams (id),
  current_rank_id uuid references public.ranks (id),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table public.training_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_tl text,
  version text not null,
  minutes text not null,
  blurb text not null,
  blurb_tl text,
  body text,
  body_tl text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  rank_id uuid not null references public.ranks (id) on delete cascade,
  code text not null unique,
  type public.requirement_type not null,
  title text not null,
  note text,
  minutes text,
  sort_order integer not null,
  document_id uuid references public.training_documents (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_rank_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rank_id uuid not null references public.ranks (id) on delete cascade,
  status text not null check (status in ('in_progress', 'complete')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, rank_id)
);

create table public.document_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document_id uuid not null references public.training_documents (id),
  document_version text not null,
  language public.doc_language not null,
  requirement_id uuid references public.requirements (id),
  accepted_at timestamptz not null default now(),
  unique (user_id, document_id, document_version)
);

create table public.training_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null,
  starts_at timestamptz not null,
  venue text not null,
  host_name text not null,
  host_user_id uuid references public.profiles (id),
  host_rank_code text,
  capacity integer not null check (capacity >= 0),
  seats_taken integer not null default 0 check (seats_taken >= 0),
  status public.event_status not null default 'scheduled',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_staff (
  event_id uuid not null references public.training_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.trainer_assignments (
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trainer_id, member_id)
);

create table public.event_bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.training_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  requirement_id uuid not null references public.requirements (id),
  status public.booking_status not null,
  waitlist_position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.event_bookings (id) on delete cascade,
  event_id uuid not null references public.training_events (id),
  user_id uuid not null references public.profiles (id),
  requirement_id uuid not null references public.requirements (id),
  status text not null check (status in ('attended', 'absent')),
  recorded_by uuid not null references public.profiles (id),
  notes text,
  recorded_at timestamptz not null default now()
);

create table public.requirement_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  requirement_id uuid not null references public.requirements (id) on delete cascade,
  status public.progress_status not null,
  completed_at timestamptz,
  source text,
  language public.doc_language,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, requirement_id)
);

create table public.trainer_verifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  requirement_id uuid not null references public.requirements (id),
  trainer_id uuid not null references public.profiles (id),
  status public.verification_status not null,
  notes text,
  verified_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rank_id uuid not null references public.ranks (id),
  reference_code text not null unique,
  issued_at timestamptz not null default now(),
  status public.certificate_status not null default 'issued',
  revoked_at timestamptz,
  revoked_reason text,
  unique (user_id, rank_id)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_profiles_team on public.profiles (team_id);
create index idx_requirements_rank on public.requirements (rank_id, sort_order);
create index idx_events_type_start on public.training_events (event_type, starts_at);
create index idx_bookings_event_status on public.event_bookings (event_id, status);
create index idx_bookings_user on public.event_bookings (user_id, requirement_id);
create index idx_completions_user on public.requirement_completions (user_id);
create index idx_certificates_user on public.certificates (user_id);
create index idx_audit_created on public.audit_log (created_at desc);

create unique index event_bookings_one_active
  on public.event_bookings (user_id, requirement_id)
  where status in ('booked', 'waitlisted');

create unique index event_bookings_one_seat
  on public.event_bookings (event_id, user_id)
  where status in ('booked', 'waitlisted');

drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists ranks_updated_at on public.ranks;
create trigger ranks_updated_at before update on public.ranks
for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists documents_updated_at on public.training_documents;
create trigger documents_updated_at before update on public.training_documents
for each row execute function public.set_updated_at();

drop trigger if exists requirements_updated_at on public.requirements;
create trigger requirements_updated_at before update on public.requirements
for each row execute function public.set_updated_at();

drop trigger if exists progress_updated_at on public.member_rank_progress;
create trigger progress_updated_at before update on public.member_rank_progress
for each row execute function public.set_updated_at();

drop trigger if exists events_updated_at on public.training_events;
create trigger events_updated_at before update on public.training_events
for each row execute function public.set_updated_at();

drop trigger if exists bookings_updated_at on public.event_bookings;
create trigger bookings_updated_at before update on public.event_bookings
for each row execute function public.set_updated_at();

drop trigger if exists completions_updated_at on public.requirement_completions;
create trigger completions_updated_at before update on public.requirement_completions
for each row execute function public.set_updated_at();

create or replace function academy.current_user_has_role(p_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = p_role
  );
$$;

create or replace function academy.is_event_staff(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.event_staff
    where event_id = p_event_id and user_id = auth.uid()
  ) or academy.current_user_has_role('admin');
$$;

create or replace function academy.is_assigned_trainer(p_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trainer_assignments
    where trainer_id = auth.uid() and member_id = p_member_id
  ) or academy.current_user_has_role('admin');
$$;

create or replace function academy.protect_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not academy.current_user_has_role('admin') then
    new.id := old.id;
    new.current_rank_id := old.current_rank_id;
    new.member_card := old.member_card;
    new.is_demo := old.is_demo;
    new.team_id := old.team_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_update on public.profiles;
create trigger protect_profile_update
before update on public.profiles
for each row execute function academy.protect_profile_update();

create or replace function academy.write_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

create or replace function academy.book_event(p_event_id uuid, p_requirement_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_event public.training_events%rowtype;
  v_req public.requirements%rowtype;
  v_booked integer;
  v_status public.booking_status;
  v_booking_id uuid;
  v_position integer;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_event from public.training_events where id = p_event_id for update;
  if not found then
    raise exception 'Event not found';
  end if;
  if v_event.status <> 'scheduled' then
    raise exception 'This session is not open for booking.';
  end if;
  if v_event.starts_at <= now() then
    raise exception 'That session has already started.';
  end if;

  select * into v_req from public.requirements where id = p_requirement_id;
  if not found or v_req.type <> 'attendance' then
    raise exception 'Requirement is not bookable.';
  end if;
  if v_event.event_type <> v_req.title then
    raise exception 'This session does not match the requirement.';
  end if;

  if exists (
    select 1 from public.event_bookings
    where user_id = v_user
      and requirement_id = p_requirement_id
      and status in ('booked', 'waitlisted')
  ) then
    raise exception 'You already have a seat or waitlist place for this requirement.';
  end if;

  if v_event.seats_taken >= v_event.capacity then
    v_status := 'waitlisted';
    select coalesce(max(waitlist_position), 0) + 1 into v_position
    from public.event_bookings
    where event_id = p_event_id and status = 'waitlisted';
  else
    v_status := 'booked';
    v_position := null;
    update public.training_events set seats_taken = seats_taken + 1 where id = p_event_id;
  end if;

  insert into public.event_bookings (event_id, user_id, requirement_id, status, waitlist_position)
  values (p_event_id, v_user, p_requirement_id, v_status, v_position)
  returning id into v_booking_id;

  insert into public.requirement_completions (user_id, requirement_id, status, source, evidence)
  values (
    v_user,
    p_requirement_id,
    case when v_status = 'booked' then 'booked'::public.progress_status else 'waitlisted'::public.progress_status end,
    'booking',
    jsonb_build_object('booking_id', v_booking_id, 'event_id', p_event_id)
  )
  on conflict (user_id, requirement_id) do update
    set status = excluded.status,
        source = excluded.source,
        evidence = excluded.evidence,
        completed_at = null;

  perform academy.write_audit(
    case when v_status = 'booked' then 'booking.created' else 'waitlist.joined' end,
    'event_bookings',
    v_booking_id,
    jsonb_build_object('event_id', p_event_id, 'status', v_status)
  );

  return jsonb_build_object('booking_id', v_booking_id, 'status', v_status, 'waitlist_position', v_position);
end;
$$;

create or replace function academy.promote_waitlist(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.training_events%rowtype;
  v_booked integer;
  v_next public.event_bookings%rowtype;
begin
  select * into v_event from public.training_events where id = p_event_id for update;
  select count(*) into v_booked from public.event_bookings where event_id = p_event_id and status = 'booked';
  if v_event.seats_taken >= v_event.capacity then
    return null;
  end if;

  select * into v_next
  from public.event_bookings
  where event_id = p_event_id and status = 'waitlisted'
  order by created_at asc
  for update skip locked
  limit 1;

  if not found then
    return null;
  end if;

  update public.event_bookings
  set status = 'booked', waitlist_position = null
  where id = v_next.id;

  update public.training_events set seats_taken = seats_taken + 1 where id = p_event_id;

  insert into public.requirement_completions (user_id, requirement_id, status, source, evidence)
  values (v_next.user_id, v_next.requirement_id, 'booked', 'waitlist_promotion', jsonb_build_object('booking_id', v_next.id))
  on conflict (user_id, requirement_id) do update
    set status = 'booked',
        source = 'waitlist_promotion',
        evidence = excluded.evidence;

  perform academy.write_audit('waitlist.promoted', 'event_bookings', v_next.id, jsonb_build_object('event_id', p_event_id));
  return v_next.id;
end;
$$;

create or replace function academy.cancel_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_booking public.event_bookings%rowtype;
  v_promoted uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_booking from public.event_bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;
  if v_booking.user_id <> v_user and not academy.current_user_has_role('admin') then
    raise exception 'Not allowed';
  end if;
  if v_booking.status not in ('booked', 'waitlisted') then
    raise exception 'This booking cannot be cancelled.';
  end if;

  update public.event_bookings set status = 'cancelled', waitlist_position = null where id = p_booking_id;

  if v_booking.status = 'booked' then
    update public.training_events
    set seats_taken = greatest(seats_taken - 1, 0)
    where id = v_booking.event_id;
  end if;

  update public.requirement_completions
  set status = 'open', completed_at = null, source = 'cancellation', evidence = '{}'::jsonb
  where user_id = v_booking.user_id and requirement_id = v_booking.requirement_id;

  v_promoted := academy.promote_waitlist(v_booking.event_id);
  perform academy.write_audit('booking.cancelled', 'event_bookings', p_booking_id, jsonb_build_object('promoted', v_promoted));

  return jsonb_build_object('cancelled', p_booking_id, 'promoted_booking_id', v_promoted);
end;
$$;

create or replace function academy.accept_document(
  p_document_id uuid,
  p_requirement_id uuid,
  p_language public.doc_language
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_doc public.training_documents%rowtype;
  v_req public.requirements%rowtype;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_doc from public.training_documents where id = p_document_id;
  if not found then
    raise exception 'Document not found';
  end if;
  select * into v_req from public.requirements where id = p_requirement_id;
  if not found or v_req.type <> 'document' or v_req.document_id <> p_document_id then
    raise exception 'Requirement does not match this document.';
  end if;

  insert into public.document_acceptances (user_id, document_id, document_version, language, requirement_id)
  values (v_user, p_document_id, v_doc.version, p_language, p_requirement_id)
  on conflict (user_id, document_id, document_version) do update
    set language = excluded.language, accepted_at = now();

  insert into public.requirement_completions (user_id, requirement_id, status, completed_at, source, language, evidence)
  values (v_user, p_requirement_id, 'done', now(), 'document', p_language, jsonb_build_object('document_id', p_document_id, 'version', v_doc.version))
  on conflict (user_id, requirement_id) do update
    set status = 'done', completed_at = now(), source = 'document', language = excluded.language, evidence = excluded.evidence;

  perform academy.write_audit('document.accepted', 'document_acceptances', p_document_id, jsonb_build_object('language', p_language, 'version', v_doc.version));
  return jsonb_build_object('ok', true, 'version', v_doc.version, 'language', p_language);
end;
$$;

create or replace function academy.record_attendance(
  p_booking_id uuid,
  p_status text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_booking public.event_bookings%rowtype;
begin
  if v_actor is null then
    raise exception 'Not authenticated';
  end if;
  if p_status not in ('attended', 'absent') then
    raise exception 'Invalid attendance status';
  end if;

  select * into v_booking from public.event_bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;
  if not academy.is_event_staff(v_booking.event_id) and not academy.current_user_has_role('staff') then
    raise exception 'Staff assignment required';
  end if;
  if v_booking.user_id = v_actor and not academy.current_user_has_role('admin') then
    raise exception 'Members cannot verify their own attendance.';
  end if;

  insert into public.attendance_records (booking_id, event_id, user_id, requirement_id, status, recorded_by, notes)
  values (p_booking_id, v_booking.event_id, v_booking.user_id, v_booking.requirement_id, p_status, v_actor, p_notes);

  update public.event_bookings set status = p_status::public.booking_status where id = p_booking_id;

  if p_status = 'attended' then
    insert into public.requirement_completions (user_id, requirement_id, status, completed_at, source, evidence)
    values (v_booking.user_id, v_booking.requirement_id, 'done', now(), 'attendance', jsonb_build_object('booking_id', p_booking_id, 'recorded_by', v_actor))
    on conflict (user_id, requirement_id) do update
      set status = 'done', completed_at = now(), source = 'attendance', evidence = excluded.evidence;
  else
    insert into public.requirement_completions (user_id, requirement_id, status, source, evidence)
    values (v_booking.user_id, v_booking.requirement_id, 'missed', 'attendance', jsonb_build_object('booking_id', p_booking_id))
    on conflict (user_id, requirement_id) do update
      set status = 'missed', completed_at = null, source = 'attendance', evidence = excluded.evidence;
  end if;

  perform academy.write_audit('attendance.recorded', 'attendance_records', p_booking_id, jsonb_build_object('status', p_status));
  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

create or replace function academy.verify_demonstration(
  p_member_id uuid,
  p_requirement_id uuid,
  p_status public.verification_status,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_req public.requirements%rowtype;
begin
  if v_actor is null then
    raise exception 'Not authenticated';
  end if;
  if p_member_id = v_actor and not academy.current_user_has_role('admin') then
    raise exception 'Members cannot verify their own demonstration.';
  end if;
  if not academy.is_assigned_trainer(p_member_id) and not academy.current_user_has_role('trainer') then
    raise exception 'Trainer assignment required';
  end if;

  select * into v_req from public.requirements where id = p_requirement_id;
  if not found or v_req.type <> 'demonstration' then
    raise exception 'Not a demonstration requirement';
  end if;

  insert into public.trainer_verifications (member_id, requirement_id, trainer_id, status, notes)
  values (p_member_id, p_requirement_id, v_actor, p_status, p_notes);

  if p_status = 'confirmed' then
    insert into public.requirement_completions (user_id, requirement_id, status, completed_at, source, evidence)
    values (p_member_id, p_requirement_id, 'done', now(), 'trainer', jsonb_build_object('trainer_id', v_actor, 'notes', coalesce(p_notes, '')))
    on conflict (user_id, requirement_id) do update
      set status = 'done', completed_at = now(), source = 'trainer', evidence = excluded.evidence;
  else
    insert into public.requirement_completions (user_id, requirement_id, status, source, evidence)
    values (p_member_id, p_requirement_id, 'rejected', 'trainer', jsonb_build_object('trainer_id', v_actor))
    on conflict (user_id, requirement_id) do update
      set status = 'rejected', completed_at = null, source = 'trainer', evidence = excluded.evidence;
  end if;

  perform academy.write_audit('demonstration.verified', 'trainer_verifications', p_requirement_id, jsonb_build_object('member_id', p_member_id, 'status', p_status));
  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

create or replace function academy.maybe_complete_derived()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trainer uuid;
  v_rank_code text;
  v_req uuid;
begin
  if new.status <> 'issued' then
    return new;
  end if;

  select r.code into v_rank_code from public.ranks r where r.id = new.rank_id;
  select ta.trainer_id into v_trainer
  from public.trainer_assignments ta
  where ta.member_id = new.user_id
  limit 1;

  if v_trainer is null then
    return new;
  end if;

  if v_rank_code = 'TL' then
    select id into v_req from public.requirements where code = 'p-der';
  elsif v_rank_code = 'SL' then
    select id into v_req from public.requirements where code = 'c-der';
  else
    return new;
  end if;

  if v_req is null then
    return new;
  end if;

  insert into public.requirement_completions (user_id, requirement_id, status, completed_at, source, evidence)
  values (v_trainer, v_req, 'done', now(), 'derived', jsonb_build_object('trainee_id', new.user_id, 'certificate_id', new.id))
  on conflict (user_id, requirement_id) do update
    set status = 'done', completed_at = now(), source = 'derived', evidence = excluded.evidence;

  return new;
end;
$$;

drop trigger if exists certificates_derived on public.certificates;
create trigger certificates_derived
after insert or update of status on public.certificates
for each row execute function academy.maybe_complete_derived();

create or replace function academy.issue_certificate(p_member_id uuid, p_rank_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_total integer;
  v_done integer;
  v_existing uuid;
  v_id uuid;
  v_ref text;
  v_code text;
begin
  if v_actor is null then
    raise exception 'Not authenticated';
  end if;
  if not (
    academy.current_user_has_role('admin')
    or (p_member_id = v_actor)
  ) then
    raise exception 'Not allowed';
  end if;
  if p_member_id = v_actor and not academy.current_user_has_role('admin') then
    -- Members may trigger issuance only after all requirements are verified.
    null;
  end if;

  select count(*) into v_total from public.requirements where rank_id = p_rank_id;
  select count(*) into v_done
  from public.requirement_completions rc
  join public.requirements r on r.id = rc.requirement_id
  where rc.user_id = p_member_id and r.rank_id = p_rank_id and rc.status = 'done';

  if v_total = 0 or v_done < v_total then
    raise exception 'All requirements must be verified before a certificate can be issued.';
  end if;

  select id into v_existing from public.certificates where user_id = p_member_id and rank_id = p_rank_id;
  if v_existing is not null then
    raise exception 'A certificate already exists for this member and rank.';
  end if;

  select code into v_code from public.ranks where id = p_rank_id;
  v_ref := 'GA-' || v_code || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.certificates (user_id, rank_id, reference_code, status)
  values (p_member_id, p_rank_id, v_ref, 'issued')
  returning id into v_id;

  insert into public.member_rank_progress (user_id, rank_id, status, completed_at)
  values (p_member_id, p_rank_id, 'complete', now())
  on conflict (user_id, rank_id) do update
    set status = 'complete', completed_at = now();

  update public.profiles
  set current_rank_id = p_rank_id
  where id = p_member_id;

  perform academy.write_audit('certificate.issued', 'certificates', v_id, jsonb_build_object('reference', v_ref));
  return jsonb_build_object('id', v_id, 'reference_code', v_ref);
end;
$$;

create or replace function academy.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base uuid;
begin
  select id into v_base from public.ranks where code = 'BASE';
  insert into public.profiles (id, full_name, current_rank_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_base
  );
  insert into public.user_roles (user_id, role) values (new.id, 'member')
  on conflict do nothing;
  if v_base is not null then
    insert into public.member_rank_progress (user_id, rank_id, status)
    values (new.id, v_base, 'in_progress')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function academy.handle_new_user();

alter table public.teams enable row level security;
alter table public.ranks enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.team_members enable row level security;
alter table public.training_documents enable row level security;
alter table public.requirements enable row level security;
alter table public.member_rank_progress enable row level security;
alter table public.document_acceptances enable row level security;
alter table public.training_events enable row level security;
alter table public.event_staff enable row level security;
alter table public.trainer_assignments enable row level security;
alter table public.event_bookings enable row level security;
alter table public.attendance_records enable row level security;
alter table public.requirement_completions enable row level security;
alter table public.trainer_verifications enable row level security;
alter table public.certificates enable row level security;
alter table public.audit_log enable row level security;

create policy teams_read on public.teams for select to authenticated using (true);
create policy ranks_read on public.ranks for select to authenticated using (true);
create policy documents_read on public.training_documents for select to authenticated using (true);
create policy requirements_read on public.requirements for select to authenticated using (true);
create policy events_read on public.training_events for select to authenticated using (true);

create policy profiles_self_read on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.current_user_has_role('staff')
  or academy.current_user_has_role('trainer')
);

create policy profiles_self_update on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy roles_self_read on public.user_roles
for select to authenticated
using (user_id = auth.uid() or academy.current_user_has_role('admin'));

create policy team_members_read on public.team_members
for select to authenticated
using (
  user_id = auth.uid()
  or team_id in (select team_id from public.profiles where id = auth.uid())
  or academy.current_user_has_role('admin')
);

create policy progress_self on public.member_rank_progress
for select to authenticated
using (user_id = auth.uid() or academy.current_user_has_role('admin') or academy.current_user_has_role('trainer'));

create policy acceptances_self on public.document_acceptances
for select to authenticated
using (user_id = auth.uid() or academy.current_user_has_role('admin'));

create policy bookings_self on public.event_bookings
for select to authenticated
using (
  user_id = auth.uid()
  or academy.is_event_staff(event_id)
  or academy.current_user_has_role('staff')
  or academy.current_user_has_role('admin')
);

create policy attendance_read on public.attendance_records
for select to authenticated
using (
  user_id = auth.uid()
  or recorded_by = auth.uid()
  or academy.current_user_has_role('staff')
  or academy.current_user_has_role('admin')
);

create policy completions_self on public.requirement_completions
for select to authenticated
using (
  user_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.current_user_has_role('trainer')
  or academy.current_user_has_role('staff')
);

create policy verifications_read on public.trainer_verifications
for select to authenticated
using (
  member_id = auth.uid()
  or trainer_id = auth.uid()
  or academy.current_user_has_role('admin')
);

create policy certificates_self on public.certificates
for select to authenticated
using (user_id = auth.uid() or academy.current_user_has_role('admin'));

create policy event_staff_read on public.event_staff
for select to authenticated
using (user_id = auth.uid() or academy.current_user_has_role('admin') or academy.current_user_has_role('staff'));

create policy trainer_assign_read on public.trainer_assignments
for select to authenticated
using (trainer_id = auth.uid() or member_id = auth.uid() or academy.current_user_has_role('admin'));

create policy audit_admin on public.audit_log
for select to authenticated
using (academy.current_user_has_role('admin'));

create policy admin_all_teams on public.teams for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));
create policy admin_all_ranks on public.ranks for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));
create policy admin_all_roles on public.user_roles for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));
create policy admin_all_events on public.training_events for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));
create policy admin_all_docs on public.training_documents for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));
create policy admin_all_reqs on public.requirements for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));
create policy admin_all_certs on public.certificates for all to authenticated
using (academy.current_user_has_role('admin')) with check (academy.current_user_has_role('admin'));

create or replace function academy.verify_certificate(p_id uuid)
returns table (
  id uuid,
  member_name text,
  rank_name text,
  reference_code text,
  issued_at timestamptz,
  status public.certificate_status
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    p.full_name,
    r.full_name,
    c.reference_code,
    c.issued_at,
    c.status
  from public.certificates c
  join public.profiles p on p.id = c.user_id
  join public.ranks r on r.id = c.rank_id
  where c.id = p_id;
$$;

grant execute on function academy.book_event(uuid, uuid) to authenticated;
grant execute on function academy.cancel_booking(uuid) to authenticated;
grant execute on function academy.accept_document(uuid, uuid, public.doc_language) to authenticated;
grant execute on function academy.record_attendance(uuid, text, text) to authenticated;
grant execute on function academy.verify_demonstration(uuid, uuid, public.verification_status, text) to authenticated;
grant execute on function academy.issue_certificate(uuid, uuid) to authenticated;
grant execute on function academy.current_user_has_role(public.app_role) to authenticated;
grant execute on function academy.is_event_staff(uuid) to authenticated;
grant execute on function academy.is_assigned_trainer(uuid) to authenticated;
grant execute on function academy.verify_certificate(uuid) to anon, authenticated;

create or replace function public.book_event(p_event_id uuid, p_requirement_id uuid)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.book_event(p_event_id, p_requirement_id); $$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.cancel_booking(p_booking_id); $$;

create or replace function public.accept_document(p_document_id uuid, p_requirement_id uuid, p_language public.doc_language)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.accept_document(p_document_id, p_requirement_id, p_language); $$;

create or replace function public.record_attendance(p_booking_id uuid, p_status text, p_notes text default null)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.record_attendance(p_booking_id, p_status, p_notes); $$;

create or replace function public.verify_demonstration(p_member_id uuid, p_requirement_id uuid, p_status public.verification_status, p_notes text default null)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.verify_demonstration(p_member_id, p_requirement_id, p_status, p_notes); $$;

create or replace function public.issue_certificate(p_member_id uuid, p_rank_id uuid)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.issue_certificate(p_member_id, p_rank_id); $$;

create or replace function public.verify_certificate(p_id uuid)
returns table (
  id uuid,
  member_name text,
  rank_name text,
  reference_code text,
  issued_at timestamptz,
  status public.certificate_status
)
language sql security invoker set search_path = public, academy
as $$ select * from academy.verify_certificate(p_id); $$;

grant execute on function public.book_event(uuid, uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.accept_document(uuid, uuid, public.doc_language) to authenticated;
grant execute on function public.record_attendance(uuid, text, text) to authenticated;
grant execute on function public.verify_demonstration(uuid, uuid, public.verification_status, text) to authenticated;
grant execute on function public.issue_certificate(uuid, uuid) to authenticated;
grant execute on function public.verify_certificate(uuid) to anon, authenticated;
