# Gentrep Academy

Staging-verified member portal for Gentrep Academy. It reconstructs the chairman’s approved dashboard—layout, ranks, requirements, booking, documents, and certificates—on the GutGuard stack: Next.js App Router, strict TypeScript, Supabase, and Vercel.

The chairman HTML is stored read-only at `reference/gentrep-academy-dashboard.html`. Do not patch that file.

## Stack

- Next.js 16 App Router + React 19 + strict TypeScript
- npm and ESLint (`eslint-config-next`)
- Supabase Auth, Postgres, RLS, and RPCs
- Zod + React Hook Form
- `lucide-react`
- Handwritten GutGuard portable CSS (no Tailwind, shadcn, or ORM)

## Local setup

1. Copy `.env.example` to `.env.local` and fill in a non-production Supabase URL and publishable key.
2. Run `npm install`.
3. Start Docker Desktop.
4. Run `npx supabase start`.
5. Run `npx supabase db reset` to replay both migrations and the deterministic synthetic seeds.
6. Run `npm run dev`.

Synthetic database identities use the reserved `gentrep.test` domain and have no password. They exist for RLS/RPC tests, not interactive sign-in. Use an invited account for browser testing.

## Database lifecycle

- `supabase/migrations/20260813120000_init.sql` is immutable migration history.
- `supabase/migrations/20260815090000_security_foundation.sql` is the forward security/correctness migration.
- `supabase/seed.sql` contains shared rank, document, requirement, and event catalog data.
- `supabase/staging_seed.sql` contains deterministic `[TEST]` identities and workflow fixtures.
- `supabase/cleanup_mock.sql` removes only reserved synthetic identities and staging-only events; it preserves the shared catalog and invited admin.

Never run the staging seed or cleanup script against production.

## Routes

- `/login`
- `/academy` member dashboard
- `/academy/ranks/[rank]`
- `/academy/events`
- `/academy/certificates/[id]`
- `/staff/events`
- `/trainer/verifications`
- `/admin`
- `/certificates/verify/[certificateCode]` public minimum-field verification

The legacy `/verify/[certificateId]` shape redirects to the canonical verification route.

## Verification

```bash
npm run test
npm run test:db
npm run test:db:concurrency
npm run lint
npm run typecheck
npm run build
```

`npm run test:all` runs unit, pgTAP authorization, and local concurrency tests. The database commands require the local Supabase stack.

## Staging operations

The staging helpers are target-locked to the approved Supabase project reference and read API-key JSON from standard input so credentials do not appear in command arguments or output.

- `npm run staging:invite-admin` creates or reuses one invited admin and assigns exactly the database `admin` role through a service-role-only audited RPC.
- `npm run staging:verify` checks the admin, fixture counts, historical trainer credit, one-role invariant, and anonymous certificate verification.

An invited user lands on `/auth/setup`, creates their own password, and is then routed to the admin workspace. Passwords and invitation links must never be copied into source control, command arguments, fixtures, or documentation.

Required environment-variable names are `SUPABASE_PROJECT_REF`, `ADMIN_EMAIL`, and, for a new invitation, `ADMIN_REDIRECT_TO`. Do not commit their real values.

## Security notes

- RLS and database RPCs are the authoritative boundary; route guards and hidden navigation are supplemental.
- Staff are restricted to explicitly assigned events.
- Trainers and mentors are restricted to active member assignments.
- Members cannot self-record attendance, demonstrations, derived requirements, roles, or certificate corrections.
- Rank advancement and certificate issuance are sequential, idempotent, and automatically audited.
- Public certificate lookup accepts only the opaque verification code and returns minimum fields.
- Early Table Editor use is limited to controlled setup or emergency technical correction; routine operations require audited functions.

This staging foundation is not a production-readiness claim. Production still requires a separate data/privacy review, authenticated browser/device/accessibility coverage, and an approved production rollout.
