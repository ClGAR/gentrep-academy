-- Support must not read unpublished claims. Members must not read the ticket inbox.

drop policy if exists cms_entries_read on public.cms_entries;
create policy cms_entries_read on public.cms_entries
for select to authenticated
using (
  academy.current_user_has_role('admin')
  or academy.current_user_has_role('clinician')
  or status = 'published'
);

drop policy if exists cases_read on public.support_cases;
create policy cases_read on public.support_cases
for select to authenticated
using (
  academy.current_user_has_role('admin')
  or academy.current_user_has_role('support')
);
