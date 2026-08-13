# Gentrep Academy

Production member portal for Gentrep Academy. Reconstructs the chairman’s approved dashboard (layout, ranks, requirements, booking, documents, certificates) on the GutGuard stack: Next.js App Router, TypeScript, Supabase, Vercel.

The chairman HTML is stored read-only at `reference/gentrep-academy-dashboard.html`. Do not patch that file.

## Stack

- Next.js 16 App Router + React 19 + strict TypeScript
- npm, ESLint (`eslint-config-next`)
- Supabase Auth (email/password), Postgres, RLS
- Zod + React Hook Form
- `lucide-react`
- GutGuard portable CSS (no Tailwind, no shadcn, no ORM)

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase keys.
2. Apply `supabase/migrations/20260813120000_init.sql`.
3. Load `supabase/seed.sql` on a **development** project only. Seed identities are fictional/demo data.
4. `npm install`
5. `npm run dev`

### Local Supabase (optional)

```bash
npx supabase start
npx supabase db reset
```

`db reset` applies migrations and `supabase/seed.sql`.

### Demo accounts (fictional)

Password for all: `DemoPassword123!`

| Email | Role |
|---|---|
| demo.member@gentrep.academy | member |
| demo.staff@gentrep.academy | staff |
| demo.trainer@gentrep.academy | trainer |
| demo.admin@gentrep.academy | admin |

## Routes

- `/login`
- `/academy` member dashboard
- `/academy/ranks/[rank]`
- `/academy/events` (redirects into the dashboard booking flow)
- `/academy/certificates/[id]`
- `/staff/events`
- `/trainer/verifications`
- `/admin`
- `/verify/[certificateId]` public, minimum fields only

## Scripts

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

## Notes

- Session refresh lives in `src/proxy.ts` (Next.js 16 name for middleware).
- Privileged writes go through `academy.*` Postgres functions; public wrappers exist for PostgREST.
- Members cannot verify their own attendance, demonstrations, derived requirements, or certificates.
- Demo “Complete rank” / “Reset all” controls from the prototype are not in production.
