-- Portal desks read through PostgREST as the signed-in user.
-- RLS still decides which rows; without SELECT the UI is empty.

grant select on table
  public.clinician_assignments,
  public.staff_notes,
  public.support_cases,
  public.cms_collections,
  public.cms_entries,
  public.cms_revisions
to authenticated;
