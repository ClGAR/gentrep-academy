-- Gentrep Academy security and correctness foundation.
--
-- Expand: assignment semantics, immutable trainer-credit snapshots, opaque
-- certificate verification codes, and supporting indexes.
-- Migrate: existing trainer assignments become primary assignments and any
-- existing certificates receive opaque verification codes.
-- Verify: see supabase/tests/database/001_security_foundation.test.sql.
-- Contract: broad staff/trainer policies and legacy UUID verification are
-- replaced below. The original migration remains immutable.
--
-- Rollback is forward-only in shared environments. Before reversing, revoke
-- access to the affected staging deployment, export audit/certificate/credit
-- evidence, restore the replaced functions and policies from the prior
-- migration, then remove additive objects only after verifying they are empty.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trainer_assignment_kind') then
    create type public.trainer_assignment_kind as enum ('primary', 'mentor');
  end if;
end
$$;

alter function academy.current_user_has_role(public.app_role)
  set search_path = pg_catalog, public;
alter function academy.promote_waitlist(uuid)
  set search_path = pg_catalog, public;
alter function academy.cancel_booking(uuid)
  set search_path = pg_catalog, public;
alter function academy.handle_new_user()
  set search_path = pg_catalog, public;

create or replace function academy.protect_profile_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is not null and not academy.current_user_has_role('admin') then
    new.id := old.id;
    new.current_rank_id := old.current_rank_id;
    new.member_card := old.member_card;
    new.is_demo := old.is_demo;
    new.team_id := old.team_id;
  end if;
  return new;
end;
$$;

alter table public.trainer_assignments
  add column if not exists assignment_kind public.trainer_assignment_kind not null default 'primary',
  add column if not exists assigned_at timestamptz not null default now(),
  add column if not exists ended_at timestamptz,
  add column if not exists assigned_by uuid references public.profiles (id),
  add constraint trainer_assignment_not_self check (trainer_id <> member_id),
  add constraint trainer_assignment_dates check (ended_at is null or ended_at >= assigned_at);

create unique index if not exists trainer_assignments_one_active_primary
  on public.trainer_assignments (member_id)
  where assignment_kind = 'primary' and ended_at is null;

create index if not exists trainer_assignments_active_lookup
  on public.trainer_assignments (trainer_id, member_id, assignment_kind)
  where ended_at is null;

create or replace function academy.new_verification_code()
returns text
language sql
volatile
set search_path = pg_catalog, public, extensions
as $$
  select encode(gen_random_bytes(18), 'hex');
$$;

alter table public.certificates
  add column if not exists verification_code text;

update public.certificates
set verification_code = academy.new_verification_code()
where verification_code is null;

alter table public.certificates
  alter column verification_code set default academy.new_verification_code(),
  alter column verification_code set not null;

create unique index if not exists certificates_verification_code_unique
  on public.certificates (verification_code);

create table if not exists public.trainer_credits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  primary_trainer_id uuid not null references public.profiles (id),
  qualifying_rank_id uuid not null references public.ranks (id),
  qualifying_certificate_id uuid not null unique references public.certificates (id) on delete cascade,
  derived_requirement_id uuid not null references public.requirements (id),
  credited_at timestamptz not null default now(),
  corrected_by uuid references public.profiles (id),
  corrected_at timestamptz,
  correction_reason text,
  unique (member_id, qualifying_rank_id, derived_requirement_id)
);

create index if not exists trainer_credits_trainer_requirement
  on public.trainer_credits (primary_trainer_id, derived_requirement_id);

alter table public.trainer_credits enable row level security;

create unique index if not exists attendance_records_one_per_booking
  on public.attendance_records (booking_id);

create unique index if not exists trainer_verifications_one_per_requirement
  on public.trainer_verifications (member_id, requirement_id);

create or replace function academy.user_has_role(p_user_id uuid, p_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_user_id and ur.role = p_role
  );
$$;

create or replace function academy.is_event_staff_for(p_user_id uuid, p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select academy.user_has_role(p_user_id, 'admin') or exists (
    select 1
    from public.event_staff es
    where es.user_id = p_user_id and es.event_id = p_event_id
  );
$$;

create or replace function academy.is_event_staff(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select academy.is_event_staff_for(auth.uid(), p_event_id);
$$;

create or replace function academy.is_assigned_trainer_to(p_trainer_id uuid, p_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select academy.user_has_role(p_trainer_id, 'admin') or exists (
    select 1
    from public.trainer_assignments ta
    where ta.trainer_id = p_trainer_id
      and ta.member_id = p_member_id
      and ta.ended_at is null
  );
$$;

create or replace function academy.is_assigned_trainer(p_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select academy.is_assigned_trainer_to(auth.uid(), p_member_id);
$$;

create or replace function academy.staff_can_view_member(p_staff_id uuid, p_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select academy.user_has_role(p_staff_id, 'admin') or exists (
    select 1
    from public.event_bookings eb
    join public.event_staff es on es.event_id = eb.event_id
    where eb.user_id = p_member_id and es.user_id = p_staff_id
  );
$$;

create or replace function academy.can_access_rank(p_user_id uuid, p_rank_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  with target as (
    select sort_order from public.ranks where id = p_rank_id
  )
  select exists (select 1 from target)
    and not exists (
      select 1
      from public.ranks prior
      cross join target
      where prior.sort_order < target.sort_order
        and not exists (
          select 1
          from public.member_rank_progress mrp
          where mrp.user_id = p_user_id
            and mrp.rank_id = prior.id
            and mrp.status = 'complete'
        )
    );
$$;

create or replace function academy.rank_requirements_complete(p_user_id uuid, p_rank_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select count(*) > 0
    and count(*) = count(*) filter (where rc.status = 'done')
  from public.requirements r
  left join public.requirement_completions rc
    on rc.requirement_id = r.id and rc.user_id = p_user_id
  where r.rank_id = p_rank_id;
$$;

drop function if exists academy.write_audit(text, text, uuid, jsonb);

create function academy.write_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb,
  p_actor_id uuid default auth.uid()
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (p_actor_id, p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

create or replace function academy.set_user_role(p_user_id uuid, p_role public.app_role)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Administrator role required';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Profile not found';
  end if;

  delete from public.user_roles where user_id = p_user_id;
  insert into public.user_roles (user_id, role) values (p_user_id, p_role);
  perform academy.write_audit(
    'role.assigned',
    'user_roles',
    p_user_id,
    jsonb_build_object('role', p_role),
    v_actor
  );
  return jsonb_build_object('user_id', p_user_id, 'role', p_role);
end;
$$;

create or replace function academy.book_event(p_event_id uuid, p_requirement_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_event public.training_events%rowtype;
  v_req public.requirements%rowtype;
  v_status public.booking_status;
  v_booking_id uuid;
  v_position integer;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;

  select * into v_event from public.training_events where id = p_event_id for update;
  if not found then raise exception 'Event not found'; end if;
  if v_event.status <> 'scheduled' then raise exception 'This session is not open for booking.'; end if;
  if v_event.starts_at <= now() then raise exception 'That session has already started.'; end if;

  select * into v_req from public.requirements where id = p_requirement_id;
  if not found or v_req.type <> 'attendance' then raise exception 'Requirement is not bookable.'; end if;
  if not academy.can_access_rank(v_user, v_req.rank_id) then raise exception 'Rank prerequisites are not complete.'; end if;
  if v_event.event_type <> v_req.title then raise exception 'This session does not match the requirement.'; end if;

  if exists (
    select 1 from public.event_bookings
    where user_id = v_user and requirement_id = p_requirement_id
      and status in ('booked', 'waitlisted')
  ) then
    raise exception 'You already have a seat or waitlist place for this requirement.';
  end if;

  if v_event.seats_taken >= v_event.capacity then
    v_status := 'waitlisted';
    select coalesce(max(waitlist_position), 0) + 1 into v_position
    from public.event_bookings where event_id = p_event_id and status = 'waitlisted';
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
    set status = excluded.status, source = excluded.source,
        evidence = excluded.evidence, completed_at = null;

  perform academy.write_audit(
    case when v_status = 'booked' then 'booking.created' else 'waitlist.joined' end,
    'event_bookings', v_booking_id,
    jsonb_build_object('event_id', p_event_id, 'status', v_status)
  );
  return jsonb_build_object('booking_id', v_booking_id, 'status', v_status, 'waitlist_position', v_position);
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
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_doc public.training_documents%rowtype;
  v_req public.requirements%rowtype;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;
  select * into v_doc from public.training_documents where id = p_document_id;
  if not found then raise exception 'Document not found'; end if;
  select * into v_req from public.requirements where id = p_requirement_id;
  if not found or v_req.type <> 'document' or v_req.document_id <> p_document_id then
    raise exception 'Requirement does not match this document.';
  end if;
  if not academy.can_access_rank(v_user, v_req.rank_id) then
    raise exception 'Rank prerequisites are not complete.';
  end if;

  insert into public.document_acceptances
    (user_id, document_id, document_version, language, requirement_id)
  values (v_user, p_document_id, v_doc.version, p_language, p_requirement_id)
  on conflict (user_id, document_id, document_version) do update
    set language = excluded.language, accepted_at = now();

  insert into public.requirement_completions
    (user_id, requirement_id, status, completed_at, source, language, evidence)
  values (
    v_user, p_requirement_id, 'done', now(), 'document', p_language,
    jsonb_build_object('document_id', p_document_id, 'version', v_doc.version)
  )
  on conflict (user_id, requirement_id) do update
    set status = 'done', completed_at = now(), source = 'document',
        language = excluded.language, evidence = excluded.evidence;

  perform academy.write_audit(
    'document.accepted', 'document_acceptances', p_document_id,
    jsonb_build_object('language', p_language, 'version', v_doc.version)
  );
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
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
  v_booking public.event_bookings%rowtype;
  v_req_rank uuid;
  v_attendance_id uuid;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if p_status not in ('attended', 'absent') then raise exception 'Invalid attendance status'; end if;

  select * into v_booking from public.event_bookings where id = p_booking_id for update;
  if not found then raise exception 'Booking not found'; end if;
  if not academy.is_event_staff_for(v_actor, v_booking.event_id) then
    raise exception 'Staff assignment required';
  end if;
  if v_booking.user_id = v_actor and not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Members cannot verify their own attendance.';
  end if;
  select rank_id into v_req_rank from public.requirements where id = v_booking.requirement_id;
  if not academy.can_access_rank(v_booking.user_id, v_req_rank) then
    raise exception 'Member rank prerequisites are not complete.';
  end if;

  insert into public.attendance_records
    (booking_id, event_id, user_id, requirement_id, status, recorded_by, notes)
  values (
    p_booking_id, v_booking.event_id, v_booking.user_id,
    v_booking.requirement_id, p_status, v_actor, p_notes
  )
  on conflict (booking_id) do update
    set status = excluded.status, recorded_by = excluded.recorded_by,
        notes = excluded.notes, recorded_at = now()
  returning id into v_attendance_id;

  update public.event_bookings set status = p_status::public.booking_status where id = p_booking_id;

  if p_status = 'attended' then
    insert into public.requirement_completions
      (user_id, requirement_id, status, completed_at, source, evidence)
    values (
      v_booking.user_id, v_booking.requirement_id, 'done', now(), 'attendance',
      jsonb_build_object('booking_id', p_booking_id, 'recorded_by', v_actor)
    )
    on conflict (user_id, requirement_id) do update
      set status = 'done', completed_at = now(), source = 'attendance', evidence = excluded.evidence;
  else
    insert into public.requirement_completions
      (user_id, requirement_id, status, source, evidence)
    values (
      v_booking.user_id, v_booking.requirement_id, 'missed', 'attendance',
      jsonb_build_object('booking_id', p_booking_id, 'recorded_by', v_actor)
    )
    on conflict (user_id, requirement_id) do update
      set status = 'missed', completed_at = null, source = 'attendance', evidence = excluded.evidence;
  end if;

  perform academy.write_audit(
    'attendance.recorded', 'attendance_records', v_attendance_id,
    jsonb_build_object('booking_id', p_booking_id, 'status', p_status)
  );
  return jsonb_build_object('ok', true, 'status', p_status, 'attendance_id', v_attendance_id);
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
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
  v_req public.requirements%rowtype;
  v_verification_id uuid;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if p_member_id = v_actor and not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Members cannot verify their own demonstration.';
  end if;
  if not academy.is_assigned_trainer_to(v_actor, p_member_id) then
    raise exception 'Trainer assignment required';
  end if;

  select * into v_req from public.requirements where id = p_requirement_id;
  if not found or v_req.type <> 'demonstration' then
    raise exception 'Not a demonstration requirement';
  end if;
  if not academy.can_access_rank(p_member_id, v_req.rank_id) then
    raise exception 'Member rank prerequisites are not complete.';
  end if;

  insert into public.trainer_verifications
    (member_id, requirement_id, trainer_id, status, notes)
  values (p_member_id, p_requirement_id, v_actor, p_status, p_notes)
  on conflict (member_id, requirement_id) do update
    set trainer_id = excluded.trainer_id, status = excluded.status,
        notes = excluded.notes, verified_at = now()
  returning id into v_verification_id;

  if p_status = 'confirmed' then
    insert into public.requirement_completions
      (user_id, requirement_id, status, completed_at, source, evidence)
    values (
      p_member_id, p_requirement_id, 'done', now(), 'trainer',
      jsonb_build_object('trainer_id', v_actor, 'verification_id', v_verification_id)
    )
    on conflict (user_id, requirement_id) do update
      set status = 'done', completed_at = now(), source = 'trainer', evidence = excluded.evidence;
  else
    insert into public.requirement_completions
      (user_id, requirement_id, status, source, evidence)
    values (
      p_member_id, p_requirement_id, 'rejected', 'trainer',
      jsonb_build_object('trainer_id', v_actor, 'verification_id', v_verification_id)
    )
    on conflict (user_id, requirement_id) do update
      set status = 'rejected', completed_at = null, source = 'trainer', evidence = excluded.evidence;
  end if;

  perform academy.write_audit(
    'demonstration.verified', 'trainer_verifications', v_verification_id,
    jsonb_build_object('member_id', p_member_id, 'requirement_id', p_requirement_id, 'status', p_status)
  );
  return jsonb_build_object('ok', true, 'status', p_status, 'verification_id', v_verification_id);
end;
$$;

create or replace function academy.complete_rank_if_ready(
  p_member_id uuid,
  p_rank_id uuid,
  p_trigger text default 'system'
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_existing public.certificates%rowtype;
  v_certificate public.certificates%rowtype;
  v_rank public.ranks%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_member_id::text || ':' || p_rank_id::text, 0));

  select * into v_rank from public.ranks where id = p_rank_id;
  if not found then raise exception 'Rank not found'; end if;
  if not exists (select 1 from public.profiles where id = p_member_id for update) then
    raise exception 'Member not found';
  end if;

  select * into v_existing
  from public.certificates
  where user_id = p_member_id and rank_id = p_rank_id
  for update;
  if found then
    if v_existing.status = 'revoked' then
      raise exception 'Certificate was revoked; administrator reissue required.';
    end if;
    return jsonb_build_object(
      'advanced', false,
      'id', v_existing.id,
      'rank_id', v_existing.rank_id,
      'reference_code', v_existing.reference_code,
      'verification_code', v_existing.verification_code
    );
  end if;

  if not academy.can_access_rank(p_member_id, p_rank_id) then
    return null;
  end if;
  if not academy.rank_requirements_complete(p_member_id, p_rank_id) then
    return null;
  end if;

  insert into public.certificates
    (user_id, rank_id, reference_code, verification_code, status)
  values (
    p_member_id,
    p_rank_id,
    'GA-' || v_rank.code || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    academy.new_verification_code(),
    'issued'
  )
  on conflict (user_id, rank_id) do nothing
  returning * into v_certificate;

  if v_certificate.id is null then
    select * into v_certificate
    from public.certificates
    where user_id = p_member_id and rank_id = p_rank_id;
  end if;

  insert into public.member_rank_progress (user_id, rank_id, status, completed_at)
  values (p_member_id, p_rank_id, 'complete', now())
  on conflict (user_id, rank_id) do update
    set status = 'complete', completed_at = coalesce(public.member_rank_progress.completed_at, excluded.completed_at);

  update public.profiles set current_rank_id = p_rank_id where id = p_member_id;

  insert into public.member_rank_progress (user_id, rank_id, status)
  select p_member_id, next_rank.id, 'in_progress'
  from public.ranks next_rank
  where next_rank.sort_order = v_rank.sort_order + 1
  on conflict (user_id, rank_id) do nothing;

  perform academy.write_audit(
    'rank.advanced', 'member_rank_progress', p_member_id,
    jsonb_build_object('rank_id', p_rank_id, 'certificate_id', v_certificate.id, 'trigger', p_trigger)
  );
  perform academy.write_audit(
    'certificate.issued', 'certificates', v_certificate.id,
    jsonb_build_object('reference', v_certificate.reference_code, 'rank_id', p_rank_id, 'trigger', p_trigger)
  );

  return jsonb_build_object(
    'advanced', true,
    'id', v_certificate.id,
    'rank_id', v_certificate.rank_id,
    'reference_code', v_certificate.reference_code,
    'verification_code', v_certificate.verification_code
  );
end;
$$;

create or replace function academy.issue_certificate(p_member_id uuid, p_rank_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
  v_result jsonb;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if p_member_id <> v_actor and not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Not allowed';
  end if;
  if not academy.can_access_rank(p_member_id, p_rank_id) then
    raise exception 'Sequential rank prerequisites are not complete.';
  end if;

  v_result := academy.complete_rank_if_ready(p_member_id, p_rank_id, 'issue_certificate');
  if v_result is null then
    raise exception 'All requirements must be verified before a certificate can be issued.';
  end if;
  return v_result;
end;
$$;

create or replace function academy.advance_after_requirement_completion()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_rank_id uuid;
begin
  if new.status <> 'done' or (tg_op = 'UPDATE' and old.status = 'done') then
    return new;
  end if;
  select rank_id into v_rank_id from public.requirements where id = new.requirement_id;
  perform academy.complete_rank_if_ready(new.user_id, v_rank_id, 'requirement_completion');
  return new;
end;
$$;

drop trigger if exists requirement_completion_advancement on public.requirement_completions;
create trigger requirement_completion_advancement
after insert or update of status on public.requirement_completions
for each row execute function academy.advance_after_requirement_completion();

drop trigger if exists certificates_derived on public.certificates;
drop function if exists academy.maybe_complete_derived();

create or replace function academy.award_primary_trainer_credit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_trainer_id uuid;
  v_rank_code text;
  v_requirement_id uuid;
  v_credit_id uuid;
begin
  if new.status <> 'issued' then return new; end if;

  select code into v_rank_code from public.ranks where id = new.rank_id;
  if v_rank_code = 'TL' then
    select id into v_requirement_id from public.requirements where code = 'p-der';
  elsif v_rank_code = 'SL' then
    select id into v_requirement_id from public.requirements where code = 'c-der';
  else
    return new;
  end if;

  select trainer_id into v_trainer_id
  from public.trainer_assignments
  where member_id = new.user_id
    and assignment_kind = 'primary'
    and assigned_at <= new.issued_at
    and (ended_at is null or ended_at > new.issued_at)
  order by assigned_at desc
  limit 1;

  if v_trainer_id is null or v_requirement_id is null then return new; end if;

  insert into public.trainer_credits
    (member_id, primary_trainer_id, qualifying_rank_id, qualifying_certificate_id, derived_requirement_id, credited_at)
  values (new.user_id, v_trainer_id, new.rank_id, new.id, v_requirement_id, new.issued_at)
  on conflict (qualifying_certificate_id) do nothing
  returning id into v_credit_id;

  if v_credit_id is null then
    select id into v_credit_id from public.trainer_credits where qualifying_certificate_id = new.id;
  end if;

  insert into public.requirement_completions
    (user_id, requirement_id, status, completed_at, source, evidence)
  values (
    v_trainer_id, v_requirement_id, 'done', new.issued_at, 'derived',
    jsonb_build_object(
      'trainer_credit_id', v_credit_id,
      'trainee_id', new.user_id,
      'certificate_id', new.id,
      'primary_trainer_id', v_trainer_id
    )
  )
  on conflict (user_id, requirement_id) do update
    set status = 'done', completed_at = least(public.requirement_completions.completed_at, excluded.completed_at),
        source = 'derived', evidence = excluded.evidence;

  perform academy.write_audit(
    'trainer_credit.awarded', 'trainer_credits', v_credit_id,
    jsonb_build_object('member_id', new.user_id, 'primary_trainer_id', v_trainer_id, 'certificate_id', new.id)
  );
  return new;
end;
$$;

create trigger certificates_derived
after insert on public.certificates
for each row execute function academy.award_primary_trainer_credit();

create or replace function academy.correct_trainer_credit(
  p_credit_id uuid,
  p_new_primary_trainer_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
  v_credit public.trainer_credits%rowtype;
  v_old_trainer uuid;
begin
  if v_actor is null or not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Administrator role required';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'Correction reason required'; end if;

  select * into v_credit from public.trainer_credits where id = p_credit_id for update;
  if not found then raise exception 'Trainer credit not found'; end if;
  if not academy.user_has_role(p_new_primary_trainer_id, 'trainer') then
    raise exception 'New credit recipient must be a trainer';
  end if;
  v_old_trainer := v_credit.primary_trainer_id;

  update public.trainer_credits
  set primary_trainer_id = p_new_primary_trainer_id,
      corrected_by = v_actor, corrected_at = now(), correction_reason = p_reason
  where id = p_credit_id;

  if not exists (
    select 1 from public.trainer_credits tc
    where tc.primary_trainer_id = v_old_trainer
      and tc.derived_requirement_id = v_credit.derived_requirement_id
  ) then
    delete from public.requirement_completions
    where user_id = v_old_trainer
      and requirement_id = v_credit.derived_requirement_id
      and source = 'derived';
  end if;

  insert into public.requirement_completions
    (user_id, requirement_id, status, completed_at, source, evidence)
  values (
    p_new_primary_trainer_id, v_credit.derived_requirement_id, 'done', v_credit.credited_at, 'derived',
    jsonb_build_object('trainer_credit_id', p_credit_id, 'corrected_by', v_actor)
  )
  on conflict (user_id, requirement_id) do update
    set status = 'done', completed_at = least(public.requirement_completions.completed_at, excluded.completed_at),
        source = 'derived', evidence = excluded.evidence;

  perform academy.write_audit(
    'trainer_credit.corrected', 'trainer_credits', p_credit_id,
    jsonb_build_object(
      'old_primary_trainer_id', v_old_trainer,
      'new_primary_trainer_id', p_new_primary_trainer_id,
      'reason', p_reason
    )
  );
  return jsonb_build_object('credit_id', p_credit_id, 'primary_trainer_id', p_new_primary_trainer_id);
end;
$$;

create or replace function academy.revoke_certificate(p_certificate_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Administrator role required';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'Revocation reason required'; end if;
  update public.certificates
  set status = 'revoked', revoked_at = now(), revoked_reason = p_reason
  where id = p_certificate_id and status = 'issued';
  if not found then raise exception 'Issued certificate not found'; end if;
  perform academy.write_audit('certificate.revoked', 'certificates', p_certificate_id, jsonb_build_object('reason', p_reason));
  return jsonb_build_object('id', p_certificate_id, 'status', 'revoked');
end;
$$;

create or replace function academy.reissue_certificate(p_certificate_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor uuid := auth.uid();
  v_certificate public.certificates%rowtype;
begin
  if v_actor is null or not academy.user_has_role(v_actor, 'admin') then
    raise exception 'Administrator role required';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'Reissue reason required'; end if;
  update public.certificates
  set status = 'issued', issued_at = now(), verification_code = academy.new_verification_code(),
      revoked_at = null, revoked_reason = null
  where id = p_certificate_id and status = 'revoked'
  returning * into v_certificate;
  if v_certificate.id is null then raise exception 'Revoked certificate not found'; end if;
  perform academy.write_audit(
    'certificate.reissued', 'certificates', p_certificate_id,
    jsonb_build_object('reason', p_reason, 'verification_code_rotated', true)
  );
  return jsonb_build_object(
    'id', v_certificate.id,
    'rank_id', v_certificate.rank_id,
    'reference_code', v_certificate.reference_code,
    'verification_code', v_certificate.verification_code,
    'status', v_certificate.status
  );
end;
$$;

drop function if exists public.verify_certificate(uuid);
drop function if exists academy.verify_certificate(uuid);

create or replace function academy.verify_certificate(p_code text)
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
set search_path = pg_catalog, public
as $$
  select c.id, p.full_name, r.full_name, c.reference_code, c.issued_at, c.status
  from public.certificates c
  join public.profiles p on p.id = c.user_id
  join public.ranks r on r.id = c.rank_id
  where c.verification_code = p_code;
$$;

create or replace function public.verify_certificate(p_code text)
returns table (
  id uuid,
  member_name text,
  rank_name text,
  reference_code text,
  issued_at timestamptz,
  status public.certificate_status
)
language sql
security invoker
set search_path = pg_catalog, public, academy
as $$ select * from academy.verify_certificate(p_code); $$;

create or replace function public.set_user_role(p_user_id uuid, p_role public.app_role)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, academy
as $$ select academy.set_user_role(p_user_id, p_role); $$;

create or replace function public.bootstrap_staging_admin(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Auth user not found';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id for update) then
    raise exception 'Profile not found';
  end if;

  delete from public.user_roles where user_id = p_user_id;
  insert into public.user_roles (user_id, role) values (p_user_id, 'admin');
  perform academy.write_audit(
    'role.assigned',
    'user_roles',
    p_user_id,
    jsonb_build_object('role', 'admin', 'method', 'staging_bootstrap'),
    null
  );
  return jsonb_build_object('user_id', p_user_id, 'role', 'admin');
end;
$$;

create or replace function public.correct_trainer_credit(p_credit_id uuid, p_new_primary_trainer_id uuid, p_reason text)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, academy
as $$ select academy.correct_trainer_credit(p_credit_id, p_new_primary_trainer_id, p_reason); $$;

create or replace function public.revoke_certificate(p_certificate_id uuid, p_reason text)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, academy
as $$ select academy.revoke_certificate(p_certificate_id, p_reason); $$;

create or replace function public.reissue_certificate(p_certificate_id uuid, p_reason text)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, academy
as $$ select academy.reissue_certificate(p_certificate_id, p_reason); $$;

revoke all on function academy.complete_rank_if_ready(uuid, uuid, text) from public, anon, authenticated;
revoke all on function academy.advance_after_requirement_completion() from public, anon, authenticated;
revoke all on function academy.award_primary_trainer_credit() from public, anon, authenticated;
revoke all on function academy.new_verification_code() from public, anon, authenticated;
revoke all on function academy.book_event(uuid, uuid) from public, anon;
revoke all on function academy.cancel_booking(uuid) from public, anon;
revoke all on function academy.accept_document(uuid, uuid, public.doc_language) from public, anon;
revoke all on function academy.record_attendance(uuid, text, text) from public, anon;
revoke all on function academy.verify_demonstration(uuid, uuid, public.verification_status, text) from public, anon;
revoke all on function academy.issue_certificate(uuid, uuid) from public, anon;
revoke all on function academy.verify_certificate(text) from public;
revoke all on function public.book_event(uuid, uuid) from public, anon;
revoke all on function public.cancel_booking(uuid) from public, anon;
revoke all on function public.accept_document(uuid, uuid, public.doc_language) from public, anon;
revoke all on function public.record_attendance(uuid, text, text) from public, anon;
revoke all on function public.verify_demonstration(uuid, uuid, public.verification_status, text) from public, anon;
revoke all on function public.issue_certificate(uuid, uuid) from public, anon;
revoke all on function academy.set_user_role(uuid, public.app_role) from public, anon;
revoke all on function academy.correct_trainer_credit(uuid, uuid, text) from public, anon;
revoke all on function academy.revoke_certificate(uuid, text) from public, anon;
revoke all on function academy.reissue_certificate(uuid, text) from public, anon;
revoke all on function public.set_user_role(uuid, public.app_role) from public, anon;
revoke all on function public.bootstrap_staging_admin(uuid) from public, anon, authenticated;
revoke all on function public.correct_trainer_credit(uuid, uuid, text) from public, anon;
revoke all on function public.revoke_certificate(uuid, text) from public, anon;
revoke all on function public.reissue_certificate(uuid, text) from public, anon;

grant execute on function public.verify_certificate(text) to anon, authenticated;
grant usage on schema public, academy to anon, authenticated, service_role;
grant select on table
  public.teams,
  public.ranks,
  public.profiles,
  public.user_roles,
  public.team_members,
  public.training_documents,
  public.requirements,
  public.member_rank_progress,
  public.document_acceptances,
  public.training_events,
  public.event_staff,
  public.trainer_assignments,
  public.event_bookings,
  public.attendance_records,
  public.requirement_completions,
  public.trainer_verifications,
  public.certificates,
  public.trainer_credits,
  public.audit_log
to authenticated;
grant update on table public.profiles to authenticated;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
grant execute on all functions in schema academy to service_role;
grant execute on function public.book_event(uuid, uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.accept_document(uuid, uuid, public.doc_language) to authenticated;
grant execute on function public.record_attendance(uuid, text, text) to authenticated;
grant execute on function public.verify_demonstration(uuid, uuid, public.verification_status, text) to authenticated;
grant execute on function public.issue_certificate(uuid, uuid) to authenticated;
grant execute on function academy.book_event(uuid, uuid) to authenticated;
grant execute on function academy.cancel_booking(uuid) to authenticated;
grant execute on function academy.accept_document(uuid, uuid, public.doc_language) to authenticated;
grant execute on function academy.record_attendance(uuid, text, text) to authenticated;
grant execute on function academy.verify_demonstration(uuid, uuid, public.verification_status, text) to authenticated;
grant execute on function academy.issue_certificate(uuid, uuid) to authenticated;
grant execute on function academy.verify_certificate(text) to anon, authenticated;
grant execute on function academy.set_user_role(uuid, public.app_role) to authenticated;
grant execute on function academy.correct_trainer_credit(uuid, uuid, text) to authenticated;
grant execute on function academy.revoke_certificate(uuid, text) to authenticated;
grant execute on function academy.reissue_certificate(uuid, text) to authenticated;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;
grant execute on function public.bootstrap_staging_admin(uuid) to service_role;
grant execute on function public.correct_trainer_credit(uuid, uuid, text) to authenticated;
grant execute on function public.revoke_certificate(uuid, text) to authenticated;
grant execute on function public.reissue_certificate(uuid, text) to authenticated;

drop policy if exists documents_read on public.training_documents;
create policy documents_read on public.training_documents
for select to authenticated
using (
  academy.current_user_has_role('admin')
  or exists (
    select 1 from public.requirements r
    where r.document_id = training_documents.id
      and academy.can_access_rank(auth.uid(), r.rank_id)
  )
);

drop policy if exists events_read on public.training_events;
create policy events_scoped_read on public.training_events
for select to authenticated
using (
  academy.current_user_has_role('admin')
  or academy.current_user_has_role('member')
  or academy.current_user_has_role('trainer')
  or academy.is_event_staff_for(auth.uid(), id)
);

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_scoped_read on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_assigned_trainer_to(auth.uid(), id)
  or academy.staff_can_view_member(auth.uid(), id)
);

drop policy if exists progress_self on public.member_rank_progress;
create policy progress_scoped_read on public.member_rank_progress
for select to authenticated
using (
  user_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_assigned_trainer_to(auth.uid(), user_id)
);

drop policy if exists bookings_self on public.event_bookings;
create policy bookings_scoped_read on public.event_bookings
for select to authenticated
using (
  user_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_event_staff_for(auth.uid(), event_id)
);

drop policy if exists attendance_read on public.attendance_records;
create policy attendance_scoped_read on public.attendance_records
for select to authenticated
using (
  user_id = auth.uid()
  or recorded_by = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_event_staff_for(auth.uid(), event_id)
);

drop policy if exists completions_self on public.requirement_completions;
create policy completions_scoped_read on public.requirement_completions
for select to authenticated
using (
  user_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_assigned_trainer_to(auth.uid(), user_id)
);

drop policy if exists verifications_read on public.trainer_verifications;
create policy verifications_scoped_read on public.trainer_verifications
for select to authenticated
using (
  member_id = auth.uid()
  or trainer_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_assigned_trainer_to(auth.uid(), member_id)
);

drop policy if exists certificates_self on public.certificates;
create policy certificates_scoped_read on public.certificates
for select to authenticated
using (
  user_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.is_assigned_trainer_to(auth.uid(), user_id)
  or academy.staff_can_view_member(auth.uid(), user_id)
);

drop policy if exists event_staff_read on public.event_staff;
create policy event_staff_scoped_read on public.event_staff
for select to authenticated
using (user_id = auth.uid() or academy.current_user_has_role('admin'));

drop policy if exists trainer_assign_read on public.trainer_assignments;
create policy trainer_assign_scoped_read on public.trainer_assignments
for select to authenticated
using (
  ((trainer_id = auth.uid() or member_id = auth.uid()) and ended_at is null)
  or academy.current_user_has_role('admin')
);

drop policy if exists admin_all_roles on public.user_roles;
drop policy if exists admin_all_certs on public.certificates;

create policy trainer_credits_scoped_read on public.trainer_credits
for select to authenticated
using (
  primary_trainer_id = auth.uid()
  or member_id = auth.uid()
  or academy.current_user_has_role('admin')
);
