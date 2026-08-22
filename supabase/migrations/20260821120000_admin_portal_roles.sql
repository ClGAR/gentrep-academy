-- Admin portal personas. Commit before any SQL that stores these values.

alter type public.app_role add value if not exists 'clinician';
alter type public.app_role add value if not exists 'support';
