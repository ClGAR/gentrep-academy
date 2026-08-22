# To do Mancera

Path on Najee’s machine: `C:\Users\najee\OneDrive\Documents\GutGuard\To do Mancera.md`

Product-repo copy (this file). **Do not edit** `GutGuard Design System/` or `GutGuard Tech Stack/` — those vaults are owner-only. Implement in the Gentrep Academy product repo.

---

## Always read the Obsidian vaults first

**Every session. Before any architecture, data, auth, deploy, dependency, or frontend change.**

Read only. Never create, edit, or delete files inside those two vaults.

### GutGuard Tech Stack (minimum)

Open, in order:

1. `GutGuard Tech Stack/Templates/00 - OWNER — Read only`
2. `GutGuard Tech Stack/Templates/00 - GutGuard Tech Stack`
3. `GutGuard Tech Stack/Templates/01 - Canonical Stack`
4. `GutGuard Tech Stack/Templates/02 - Supabase Conventions`
5. `GutGuard Tech Stack/Templates/03 - Frontend Conventions`
6. `GutGuard Tech Stack/Templates/04 - Deploy and Env`
7. `GutGuard Tech Stack/Templates/07 - Using the Tech Stack with Cursor`
8. `GutGuard Tech Stack/Templates/AGENTS-tech-stack` (if present)
9. `GutGuard Tech Stack/Templates/05 - Playbook` when the work is a repeatable flow

If those notes also exist at the vault root (no `Templates/`), read the root copies. Same titles.

### GutGuard Design System (before any UI)

Open, in order:

1. `GutGuard Design System/Templates/00 - OWNER — Read only`
2. `GutGuard Design System/Templates/00 - GutGuard Design System`
3. `GutGuard Design System/Templates/01 - Visual Foundations`
4. `GutGuard Design System/Templates/03 - Portable CSS Starter`
5. `GutGuard Design System/Templates/07 - Using the DS with Cursor`
6. `GutGuard Design System/Templates/04 - Stitch Workflow` when a Stitch mock is in play
7. `GutGuard Design System/Templates/05 - Playbook` when repeating a screen pattern
8. Foundations / Components / Systems / Showcase as needed for the screen

### Stack defaults (do not violate)

- Next.js App Router + TypeScript
- Supabase, no ORM
- Vercel + npm + ESLint
- Zod + React Hook Form
- Design System portable CSS
- **No Tailwind. No shadcn.**
- Service role keys: server / Vercel only — never `NEXT_PUBLIC_`
- Member dashboard: keep chairman HTML layout/IA; skin with Doctors tokens
- New screens (login, staff, trainer, **admin**, verify): follow the Design System
- Recognition: bone `#F4F1EA`, blue `#0608A9`, ink `#0F0F18`, gold `#B08D5B`, Fraunces + Inter Tight, paper grain, uppercase micro-labels

---

## Work on the board: Admin Portal (GutGuard Lifestyle)

Enterprise ops desk at `/admin`. Member training stays on `/academy`. Staff check-in stays on `/staff`. Trainer queue stays on `/trainer`.

Canonical spec in the product repo: `docs/admin-portal-architecture.md`  
PR: https://github.com/atc1989/gentrep-academy/pull/2

### Roles

| Persona | `app_role` | Desk |
|---|---|---|
| Super Admin | `admin` | Full portal, publish, audit, academy desks |
| Clinician / Dietitian | `clinician` | Assigned caseload, clinical notes, protocol review. No global directory. No tickets. |
| Customer Support | `support` | People + tickets + holds. No clinical notes. No publish. |

HCI: role-home, progressive disclosure, omit unafforded controls, search before browse, one primary action, desktop + tablet first.

### What already landed (PR #2)

- Capability matrix in `src/lib/admin/rbac.ts`
- Admin shell + Today / People / Record / Caseload / CMS / Tickets / Audit
- Migrations: `clinician` + `support` roles, `clinician_assignments`, `staff_notes`, `support_cases`, CMS tables
- Privileged RPCs + RLS split (clinical notes ≠ support notes)
- Demo users: `demo.admin@`, `demo.clinician@`, `demo.support@gentrep.academy` (password `DemoPassword123!`)

---

## Phased to-do (Mancera)

Check a box only after the vault reads for that kind of work are done.

### Phase 0 — Vault gate (every session)

- [x] Read Tech Stack OWNER + Canonical Stack + Supabase + Frontend + Deploy
- [x] Read Design System OWNER + Visual Foundations + Portable CSS + Using the DS with Cursor
- [x] Confirm: no Tailwind, no shadcn, no public service-role key
- [x] Confirm: member dashboard layout is not being rewritten

### Phase 1 — Land architecture on a dev project

- [x] Review `docs/admin-portal-architecture.md` and PR #2
- [x] Apply `supabase/migrations/` in order (init, then `20260821120000_admin_portal_roles`, then `20260821121000_admin_portal`)
- [x] Load `supabase/seed.sql` on **development only**
- [ ] Sign in as Super Admin → lands on `/admin`, sees People / CMS / Tickets / Audit
- [ ] Sign in as Clinician → rail is Today / Caseload / Content only
- [ ] Sign in as Support → rail is Today / People / Content / Tickets; no clinical notes on a member record
- [ ] Sign in as member / trainer / staff → academy desks, not `/admin`

### Phase 2 — User management

- [x] Directory search (name, email, card) and status filter
- [x] Member 360 field masks match the spec (Support never sees clinical notes)
- [x] Account hold / lift for Support; full status set for Super Admin
- [x] Super Admin: assign clinician to a member
- [x] Super Admin: role assignment UI (capability exists; finish the control if still SQL-only)
- [x] Internal notes: clinical vs support kinds stay on separate RLS paths

### Phase 3 — Clinician / Dietitian desk

- [x] Caseload shows assigned members only
- [x] Opening a non-assigned member 404s / redirects
- [x] Clinical note composer on the assigned record
- [x] Content: author protocol + education; send for review; approve / reject
- [x] Clinician cannot publish
- [x] Tablet: caseload as cards, overlay rail

### Phase 4 — Customer Support desk

- [x] Ticket inbox with status filter and advance
- [x] Open a follow-up ticket from the member record
- [x] Read published CMS (FAQ / education) as answers to cite
- [x] Cannot edit CMS, cannot see clinical notes, cannot open caseload

### Phase 5 — Content CMS

- [x] Collections: education, protocol, product_copy, faq, announcement
- [x] Protocol + product copy require clinical review before publish
- [x] Super Admin publish only
- [x] Every save writes `cms_revisions`
- [x] Claims language stays off live until approved (product copy)

### Phase 6 — Design System skin (admin is a new screen)

- [x] Re-read Visual Foundations + Portable CSS before CSS changes
- [x] Bone / blue / ink / gold, Fraunces titles, Inter Tight UI, uppercase micro-labels, paper grain
- [x] Desktop ≥1100px sticky rail; tablet 768–1099 overlay menu
- [x] One primary action per view; empty states use `gg-empty`
- [x] 44px hit targets, gold focus rings, skip link to `#admin-main`

### Phase 7 — Security, env, deploy

- [x] Re-read Supabase conventions + Deploy and Env
- [x] RLS: clinician assigned-only; support notes ≠ clinical notes; audit admin-only
- [x] Privileged writes only through `academy.*` / public wrappers
- [x] Vercel: `NEXT_PUBLIC_SUPABASE_URL` + publishable/anon key; secret/service role **server only**; `NEXT_PUBLIC_SITE_URL`
- [x] `npm test`, `npx tsc --noEmit`, `npm run lint`

### Phase 8 — Done when

- [ ] Three personas can finish a real task without seeing each other’s privileged data
- [x] Chairman member dashboard is untouched in layout/IA
- [ ] Spec and this note still match the running `/admin` desk
