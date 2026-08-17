-- Pin the legacy timestamp trigger's name resolution after the security advisor
-- identified its caller-controlled search_path.
alter function public.set_updated_at()
  set search_path = pg_catalog, public;
