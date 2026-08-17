-- Hosted staging test support. This is not a product migration.
-- The linked CLI test role needs schema usage to run pgTAP assertions.
create extension if not exists pgtap with schema extensions;
grant usage on schema extensions to postgres;
grant usage on schema extensions to cli_login_postgres;
