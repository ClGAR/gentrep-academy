-- GutGuard Admin Portal: user management, caseload, support, and CMS.
-- Privileged writes stay in the unexposed academy schema.

create type public.account_status as enum ('invited', 'active', 'suspended', 'closed');
create type public.note_kind as enum ('clinical', 'support', 'system');
create type public.case_status as enum ('open', 'pending', 'resolved', 'closed');
create type public.case_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.cms_status as enum ('draft', 'in_review', 'published', 'archived');
create type public.clinical_review_status as enum ('not_required', 'pending', 'approved', 'rejected');

alter table public.profiles
  add column if not exists email text,
  add column if not exists account_status public.account_status not null default 'active',
  add column if not exists locale text not null default 'en',
  add column if not exists last_seen_at timestamptz,
  add column if not exists support_hold boolean not null default false;

create unique index if not exists profiles_email_unique on public.profiles (email) where email is not null;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create table public.clinician_assignments (
  clinician_id uuid not null references public.profiles (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'ended')),
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (clinician_id, member_id)
);

create table public.staff_notes (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  kind public.note_kind not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.support_cases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  opened_by uuid not null references public.profiles (id),
  assignee_id uuid references public.profiles (id),
  title text not null,
  topic text not null,
  status public.case_status not null default 'open',
  priority public.case_priority not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.cms_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  requires_clinical_review boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.cms_collections (id),
  slug text not null,
  title text not null,
  excerpt text,
  body text not null,
  locale text not null default 'en',
  status public.cms_status not null default 'draft',
  clinical_review public.clinical_review_status not null default 'not_required',
  version integer not null default 1,
  published_at timestamptz,
  published_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, slug, locale)
);

create table public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.cms_entries (id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  editor_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (entry_id, version)
);

create index idx_profiles_status on public.profiles (account_status);
create index idx_clinician_member on public.clinician_assignments (member_id) where status = 'active';
create index idx_notes_subject on public.staff_notes (subject_user_id, created_at desc);
create index idx_cases_status on public.support_cases (status, priority, updated_at desc);
create index idx_cases_member on public.support_cases (member_id, created_at desc);
create index idx_cms_status on public.cms_entries (status, updated_at desc);

drop trigger if exists support_cases_updated_at on public.support_cases;
create trigger support_cases_updated_at before update on public.support_cases
for each row execute function public.set_updated_at();

drop trigger if exists cms_entries_updated_at on public.cms_entries;
create trigger cms_entries_updated_at before update on public.cms_entries
for each row execute function public.set_updated_at();

create or replace function academy.is_assigned_clinician(p_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clinician_assignments
    where clinician_id = auth.uid()
      and member_id = p_member_id
      and status = 'active'
  ) or academy.current_user_has_role('admin');
$$;

create or replace function academy.is_portal_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    academy.current_user_has_role('admin')
    or academy.current_user_has_role('clinician')
    or academy.current_user_has_role('support');
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
  insert into public.profiles (id, full_name, email, current_rank_id, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    v_base,
    'active'
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

create or replace function academy.set_account_status(p_user_id uuid, p_status public.account_status)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if not (
    academy.current_user_has_role('admin')
    or academy.current_user_has_role('support')
  ) then
    raise exception 'Not allowed';
  end if;
  if academy.current_user_has_role('support') and not academy.current_user_has_role('admin') then
    if p_status not in ('active', 'suspended') then
      raise exception 'Support can only place or lift a hold.';
    end if;
  end if;

  update public.profiles
  set account_status = p_status, support_hold = (p_status = 'suspended')
  where id = p_user_id;
  if not found then raise exception 'Profile not found'; end if;

  perform academy.write_audit('account.status', 'profiles', p_user_id, jsonb_build_object('status', p_status));
  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

create or replace function academy.add_staff_note(
  p_subject_user_id uuid,
  p_kind public.note_kind,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if length(trim(p_body)) < 3 then raise exception 'Write a short note.'; end if;

  if p_kind = 'clinical' then
    if not academy.is_assigned_clinician(p_subject_user_id) and not academy.current_user_has_role('admin') then
      raise exception 'Clinical notes require an assigned clinician.';
    end if;
  elsif p_kind = 'support' then
    if not (academy.current_user_has_role('support') or academy.current_user_has_role('admin')) then
      raise exception 'Support notes require a support role.';
    end if;
  else
    if not academy.current_user_has_role('admin') then
      raise exception 'Not allowed';
    end if;
  end if;

  insert into public.staff_notes (subject_user_id, author_id, kind, body)
  values (p_subject_user_id, v_actor, p_kind, trim(p_body))
  returning id into v_id;

  perform academy.write_audit('note.created', 'staff_notes', v_id, jsonb_build_object('kind', p_kind, 'subject', p_subject_user_id));
  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function academy.assign_clinician(p_member_id uuid, p_clinician_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not academy.current_user_has_role('admin') then raise exception 'Not allowed'; end if;

  insert into public.clinician_assignments (clinician_id, member_id, status)
  values (p_clinician_id, p_member_id, 'active')
  on conflict (clinician_id, member_id) do update
    set status = 'active', ended_at = null, assigned_at = now();

  perform academy.write_audit(
    'caseload.assigned',
    'clinician_assignments',
    p_member_id,
    jsonb_build_object('clinician_id', p_clinician_id)
  );
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function academy.open_support_case(
  p_member_id uuid,
  p_title text,
  p_topic text,
  p_priority public.case_priority
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if not (academy.current_user_has_role('support') or academy.current_user_has_role('admin')) then
    raise exception 'Not allowed';
  end if;

  insert into public.support_cases (member_id, opened_by, assignee_id, title, topic, priority)
  values (p_member_id, v_actor, v_actor, trim(p_title), trim(p_topic), p_priority)
  returning id into v_id;

  perform academy.write_audit('ticket.opened', 'support_cases', v_id, jsonb_build_object('member_id', p_member_id));
  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function academy.set_support_case_status(
  p_case_id uuid,
  p_status public.case_status
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not (academy.current_user_has_role('support') or academy.current_user_has_role('admin')) then
    raise exception 'Not allowed';
  end if;

  update public.support_cases
  set
    status = p_status,
    closed_at = case when p_status in ('resolved', 'closed') then now() else null end
  where id = p_case_id;
  if not found then raise exception 'Ticket not found'; end if;

  perform academy.write_audit('ticket.status', 'support_cases', p_case_id, jsonb_build_object('status', p_status));
  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

create or replace function academy.upsert_cms_entry(
  p_id uuid,
  p_collection_slug text,
  p_title text,
  p_slug text,
  p_excerpt text,
  p_body text,
  p_locale text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_collection public.cms_collections%rowtype;
  v_id uuid;
  v_review public.clinical_review_status;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  if not (
    academy.current_user_has_role('admin')
    or academy.current_user_has_role('clinician')
  ) then
    raise exception 'Not allowed';
  end if;

  select * into v_collection from public.cms_collections where slug = p_collection_slug;
  if not found then raise exception 'Unknown collection'; end if;

  if academy.current_user_has_role('clinician') and not academy.current_user_has_role('admin') then
    if v_collection.slug not in ('protocol', 'education') then
      raise exception 'Clinicians can edit protocol and education only.';
    end if;
  end if;

  v_review := case when v_collection.requires_clinical_review then 'pending'::public.clinical_review_status else 'not_required'::public.clinical_review_status end;

  if p_id is null then
    insert into public.cms_entries (
      collection_id, slug, title, excerpt, body, locale, status, clinical_review, updated_by
    )
    values (
      v_collection.id, p_slug, p_title, p_excerpt, p_body, coalesce(p_locale, 'en'), 'draft', v_review, v_actor
    )
    returning id into v_id;
  else
    update public.cms_entries
    set
      title = p_title,
      slug = p_slug,
      excerpt = p_excerpt,
      body = p_body,
      locale = coalesce(p_locale, locale),
      updated_by = v_actor,
      version = version + 1,
      clinical_review = case
        when status = 'published' then clinical_review
        when v_collection.requires_clinical_review and clinical_review = 'approved' then 'pending'::public.clinical_review_status
        else clinical_review
      end
    where id = p_id and status <> 'archived'
    returning id into v_id;
    if v_id is null then raise exception 'Entry cannot be edited.'; end if;
  end if;

  insert into public.cms_revisions (entry_id, version, snapshot, editor_id)
  select e.id, e.version, to_jsonb(e), v_actor from public.cms_entries e where e.id = v_id;

  perform academy.write_audit('cms.saved', 'cms_entries', v_id, jsonb_build_object('slug', p_slug));
  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function academy.apply_cms_action(p_entry_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_entry public.cms_entries%rowtype;
  v_requires boolean;
begin
  if v_actor is null then raise exception 'Not authenticated'; end if;
  select * into v_entry from public.cms_entries where id = p_entry_id;
  if not found then raise exception 'Entry not found'; end if;
  select requires_clinical_review into v_requires from public.cms_collections where id = v_entry.collection_id;

  if p_action = 'submit_review' then
    if not (academy.current_user_has_role('admin') or academy.current_user_has_role('clinician')) then
      raise exception 'Not allowed';
    end if;
    if v_entry.status <> 'draft' then raise exception 'Only drafts can be sent for review.'; end if;
    update public.cms_entries set status = 'in_review', clinical_review = 'pending', updated_by = v_actor where id = p_entry_id;
  elsif p_action in ('approve', 'reject') then
    if not (academy.current_user_has_role('admin') or academy.current_user_has_role('clinician')) then
      raise exception 'Not allowed';
    end if;
    if v_entry.status <> 'in_review' then raise exception 'Nothing is waiting for review.'; end if;
    if p_action = 'approve' then
      update public.cms_entries set clinical_review = 'approved', updated_by = v_actor where id = p_entry_id;
    else
      update public.cms_entries set status = 'draft', clinical_review = 'rejected', updated_by = v_actor where id = p_entry_id;
    end if;
  elsif p_action = 'publish' then
    if not academy.current_user_has_role('admin') then raise exception 'Only Super Admin can publish.'; end if;
    if v_requires and v_entry.clinical_review <> 'approved' then
      raise exception 'Clinical review must be approved before this entry can go live.';
    end if;
    update public.cms_entries
    set status = 'published', published_at = now(), published_by = v_actor, updated_by = v_actor
    where id = p_entry_id;
  elsif p_action = 'archive' then
    if not academy.current_user_has_role('admin') then raise exception 'Not allowed'; end if;
    update public.cms_entries set status = 'archived', updated_by = v_actor where id = p_entry_id and status = 'published';
  elsif p_action = 'restore' then
    if not (academy.current_user_has_role('admin') or academy.current_user_has_role('clinician')) then
      raise exception 'Not allowed';
    end if;
    update public.cms_entries set status = 'draft', updated_by = v_actor where id = p_entry_id and status = 'archived';
  else
    raise exception 'Unknown action';
  end if;

  perform academy.write_audit('cms.' || p_action, 'cms_entries', p_entry_id, '{}'::jsonb);
  return jsonb_build_object('ok', true, 'action', p_action);
end;
$$;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.current_user_has_role('staff')
  or academy.current_user_has_role('trainer')
  or academy.current_user_has_role('support')
  or academy.is_assigned_clinician(id)
);

drop policy if exists roles_self_read on public.user_roles;
create policy roles_self_read on public.user_roles
for select to authenticated
using (
  user_id = auth.uid()
  or academy.current_user_has_role('admin')
  or academy.current_user_has_role('support')
);

alter table public.clinician_assignments enable row level security;
alter table public.staff_notes enable row level security;
alter table public.support_cases enable row level security;
alter table public.cms_collections enable row level security;
alter table public.cms_entries enable row level security;
alter table public.cms_revisions enable row level security;

create policy clinician_assign_read on public.clinician_assignments
for select to authenticated
using (
  clinician_id = auth.uid()
  or member_id = auth.uid()
  or academy.current_user_has_role('admin')
);

create policy notes_read on public.staff_notes
for select to authenticated
using (
  academy.current_user_has_role('admin')
  or (kind = 'clinical' and academy.is_assigned_clinician(subject_user_id))
  or (kind = 'support' and academy.current_user_has_role('support'))
);

create policy cases_read on public.support_cases
for select to authenticated
using (
  academy.current_user_has_role('admin')
  or academy.current_user_has_role('support')
  or member_id = auth.uid()
);

create policy cms_collections_read on public.cms_collections
for select to authenticated
using (academy.is_portal_operator());

create policy cms_entries_read on public.cms_entries
for select to authenticated
using (
  academy.is_portal_operator()
  or status = 'published'
);

create policy cms_revisions_admin on public.cms_revisions
for select to authenticated
using (academy.current_user_has_role('admin') or academy.current_user_has_role('clinician'));

grant execute on function academy.is_assigned_clinician(uuid) to authenticated;
grant execute on function academy.is_portal_operator() to authenticated;
grant execute on function academy.set_account_status(uuid, public.account_status) to authenticated;
grant execute on function academy.add_staff_note(uuid, public.note_kind, text) to authenticated;
grant execute on function academy.assign_clinician(uuid, uuid) to authenticated;
grant execute on function academy.open_support_case(uuid, text, text, public.case_priority) to authenticated;
grant execute on function academy.set_support_case_status(uuid, public.case_status) to authenticated;
grant execute on function academy.upsert_cms_entry(uuid, text, text, text, text, text, text) to authenticated;
grant execute on function academy.apply_cms_action(uuid, text) to authenticated;

create or replace function public.set_account_status(p_user_id uuid, p_status public.account_status)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.set_account_status(p_user_id, p_status); $$;

create or replace function public.add_staff_note(p_subject_user_id uuid, p_kind public.note_kind, p_body text)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.add_staff_note(p_subject_user_id, p_kind, p_body); $$;

create or replace function public.assign_clinician(p_member_id uuid, p_clinician_id uuid)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.assign_clinician(p_member_id, p_clinician_id); $$;

create or replace function public.open_support_case(p_member_id uuid, p_title text, p_topic text, p_priority public.case_priority)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.open_support_case(p_member_id, p_title, p_topic, p_priority); $$;

create or replace function public.set_support_case_status(p_case_id uuid, p_status public.case_status)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.set_support_case_status(p_case_id, p_status); $$;

create or replace function public.upsert_cms_entry(
  p_id uuid, p_collection_slug text, p_title text, p_slug text, p_excerpt text, p_body text, p_locale text
)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.upsert_cms_entry(p_id, p_collection_slug, p_title, p_slug, p_excerpt, p_body, p_locale); $$;

create or replace function public.apply_cms_action(p_entry_id uuid, p_action text)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.apply_cms_action(p_entry_id, p_action); $$;

grant execute on function public.set_account_status(uuid, public.account_status) to authenticated;
grant execute on function public.add_staff_note(uuid, public.note_kind, text) to authenticated;
grant execute on function public.assign_clinician(uuid, uuid) to authenticated;
grant execute on function public.open_support_case(uuid, text, text, public.case_priority) to authenticated;
grant execute on function public.set_support_case_status(uuid, public.case_status) to authenticated;
grant execute on function public.upsert_cms_entry(uuid, text, text, text, text, text, text) to authenticated;
grant execute on function public.apply_cms_action(uuid, text) to authenticated;

create or replace function academy.toggle_user_role(
  p_user_id uuid,
  p_role public.app_role,
  p_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_remaining int;
begin
  if v_actor is null or not academy.current_user_has_role('admin') then
    raise exception 'Administrator role required';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Profile not found';
  end if;

  if p_enabled then
    insert into public.user_roles (user_id, role) values (p_user_id, p_role)
    on conflict do nothing;
  else
    delete from public.user_roles where user_id = p_user_id and role = p_role;
    select count(*) into v_remaining from public.user_roles where user_id = p_user_id;
    if v_remaining = 0 then
      insert into public.user_roles (user_id, role) values (p_user_id, 'member');
    end if;
  end if;

  perform academy.write_audit(
    'role.toggled',
    'user_roles',
    p_user_id,
    jsonb_build_object('role', p_role, 'enabled', p_enabled)
  );
  return jsonb_build_object('ok', true, 'role', p_role, 'enabled', p_enabled);
end;
$$;

create or replace function public.toggle_user_role(
  p_user_id uuid,
  p_role public.app_role,
  p_enabled boolean
)
returns jsonb language sql security invoker set search_path = public, academy
as $$ select academy.toggle_user_role(p_user_id, p_role, p_enabled); $$;

grant execute on function academy.toggle_user_role(uuid, public.app_role, boolean) to authenticated;
grant execute on function public.toggle_user_role(uuid, public.app_role, boolean) to authenticated;

insert into public.cms_collections (id, slug, name, description, requires_clinical_review)
values
  ('c1000000-0000-4000-8000-000000000001', 'education', 'Education', 'Lifestyle explainers members can read.', false),
  ('c1000000-0000-4000-8000-000000000002', 'protocol', 'Protocol', 'Dietitian-authored care protocols.', true),
  ('c1000000-0000-4000-8000-000000000003', 'product_copy', 'Product copy', 'Claims-sensitive product language.', true),
  ('c1000000-0000-4000-8000-000000000004', 'faq', 'FAQ', 'Support answers reused at the desk.', false),
  ('c1000000-0000-4000-8000-000000000005', 'announcement', 'Announcement', 'Operational notices for the portal.', false)
on conflict (slug) do nothing;
