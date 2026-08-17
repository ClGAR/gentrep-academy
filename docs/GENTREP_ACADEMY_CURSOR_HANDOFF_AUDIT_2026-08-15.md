# Gentrep Academy — Cursor Handoff Audit

> Audit date: 2026-08-15 (Asia/Manila)  
> Repository: `C:\Users\mance\Projects\gentrep-academy`  
> Purpose: transfer the complete Gentrep Academy conversation state into Cursor without transferring secrets or losing implementation boundaries.  
> Evidence order: executable repository state and current read-only staging checks override older conversation summaries; approved owner rules override recommendations.

## 1. Executive handoff

Gentrep Academy is a Next.js/Supabase member-training portal for GutGuard. It preserves the chairman-approved member dashboard while providing database-backed ranks, document acceptance, events, bookings, attendance, trainer verification, progression, certificates, public certificate verification, staff/trainer operations, and an admin overview.

The isolated staging foundation is implemented and verified. The database migrations, deterministic fixtures, RLS/RPC matrix, concurrency protection, preview deployment, admin-only identity, and password Auth sign-in all work in staging. The application is not production-ready and no authenticated browser journey has been completed.

The current implementation is entirely in the local working tree. It has not been committed or pushed. Cursor must preserve the dirty tree and must not switch branches, reset files, or assume `main` represents the staging work.

## 2. Read this first in Cursor

1. `AGENTS.md`
2. This handoff audit
3. `docs/GENTREP_ACADEMY_PROJECT_BRIEF.md`
4. `README.md`
5. `supabase/migrations/20260815090000_security_foundation.sql`
6. `supabase/tests/database/001_security_foundation.test.sql`
7. `supabase/staging_seed.sql` and `supabase/cleanup_mock.sql`

The lower portion of the project brief is a historical pre-staging audit. Its old statements are useful history but are superseded by the dated staging update and this handoff.

## 3. Approved targets and non-negotiable boundaries

| Area | Approved target | Boundary |
| --- | --- | --- |
| Repository workspace | `C:\Users\mance\Projects\gentrep-academy` | Preserve the current dirty working tree |
| Supabase | `gentrep-academy`, ref `qipwvvhmhxqzlmezvjxu` | Isolated staging only |
| Vercel team/project | `mancerarogers-projects/gentrep-academy` | Preview only |
| Vercel project ID | `prj_0ek2KAWnicjCncMQ3l96Et6aMpFq` | Do not relink, rename, or promote |
| Connected GitHub repository | `ClGAR/gentrep-academy` | Do not push without explicit owner instruction |
| Current Preview | `https://gentrep-academy-c9tty0wls-mancerarogers-projects.vercel.app` | Never treat as Production |

Never modify or use:

- `atcs-projects-2f85c923/gentrep-academy-qune`
- Vercel Production or a production Supabase project
- the `atc1989/gentrep-academy` remote
- either Obsidian vault
- `reference/gentrep-academy-dashboard.html`
- `supabase/migrations/20260813120000_init.sql`

Do not introduce Tailwind, shadcn, Prisma, Drizzle, an ORM, a new UI system, a broad redesign, or unapproved features.

## 4. Source precedence and approved product rules

Source precedence:

1. `AGENTS.md` and explicit owner instructions
2. Obsidian owner/canonical notes, read-only
3. Approved chairman HTML for member layout/content/flows
4. Approved Gentrep business rules
5. Repository implementation and tests
6. Recommendations and historical notes

Approved authorization and progression rules now implemented:

- Staff may operate only on explicitly assigned events; administrators override.
- Trainers and mentors may operate only on explicitly assigned members; administrators override.
- A member has one active primary trainer plus optional mentors.
- Only the primary trainer at qualifying completion receives derived credit.
- Historical trainer credit does not move after reassignment.
- Credit corrections are admin-only and audited.
- Elevated roles cannot be self-assigned.
- Members may view the rank roadmap but cannot write locked-rank progress.
- Sequential prerequisites are authoritative database rules, not merely UI locks.
- Rank advancement is automatic, sequential, idempotent, and audited.
- Certificate issuance is atomic with completion where practical and returns the newly completed rank's certificate.
- Certificate verification uses an opaque, unguessable code at `/certificates/verify/{certificate_code}`.
- Table Editor is setup/emergency tooling only, not the routine admin interface.

Explicitly excluded from the completed phase:

- simulated video-player implementation
- door scanning
- date switching
- waitlist notifications
- unrelated product features or redesign

## 5. Conversation chronology and outcomes

### A. Initial repository and architecture work

- Reconstructed the chairman prototype as maintainable Next.js/React code.
- Established the canonical stack: Next.js App Router, React 19, strict TypeScript, Supabase, Vercel, Zod, React Hook Form, Lucide, and handwritten CSS.
- Kept the chairman HTML as an immutable reference.
- Produced the original repository/project brief and recorded that the initial backend was production-shaped but not live-verified.

### B. Governance and owner decisions

- Completed the read-only governance preflight against repository and Obsidian rules.
- Owner approved least-privilege staff/trainer assignments, primary-trainer credit, sequential ranks, automatic certificates, invitation/admin account rules, and staging-only testing.
- Owner later selected the exact Supabase and Vercel staging targets listed above.

### C. Database and security implementation

- Confirmed the selected Supabase project was empty and isolated before applying product migrations.
- Applied the immutable initial migration unchanged.
- Added a forward security/correctness migration and a follow-up advisor-hardening migration.
- Added local and hosted pgTAP authorization tests plus a real parallel-write concurrency test.
- Added deterministic staging seed and guarded cleanup tooling.
- Verified seed rerun idempotency and cleanup/reseed behavior.

### D. Application corrections

- Fixed certificate selection so a newly completed rank opens its own certificate rather than an older certificate.
- Replaced public certificate IDs with opaque verification codes and a canonical route.
- Added `/auth/setup` for invitation completion.
- Added sign-in form alert and field-error accessibility relationships.
- Added environment URL validation and Vercel preview fallback behavior.
- Kept the approved dashboard and handwritten CSS; no redesign occurred.

### E. Staging admin and Auth

- Created/reused one admin-only staging identity and enforced exactly one `admin` application role through the database.
- The original invitation pointed to an earlier immutable Preview.
- After owner authorization, allow-listed the exact final `/auth/setup` redirect and sent one replacement invitation. Total invitation emails: two. Recovery emails: zero.
- After later owner authorization, set a temporary credential through the staging Admin API, confirmed the Auth email identity, and verified password sign-in successfully.
- The temporary credential must never be recovered from conversation history, copied into Cursor, stored in a file, or included in documentation.

### F. Deployment and smoke checks

- Configured the selected Vercel project's Preview environment with only the browser-public Supabase URL and publishable key.
- No service-role secret was added to Vercel.
- Deployed Preview `dpl_63rK8SGXqe4orJMNQYiEBQoG2JxZ`, status `READY`, target `preview`.
- HTTP checks passed: `/login` 200, `/auth/setup` 200, anonymous `/admin` redirects to `/login`, and the certificate verification route resolves.
- Windows Computer Use stopped before interaction because it could not confidently determine the active Brave URL. No browser UI acceptance was completed.

## 6. Current Git and working-tree state

- Current branch: `main`
- HEAD: `f507a312429ac272d2eebf6f3c0c3f563789f5ce`
- Tracking: `cigar/main`
- Current staging implementation: uncommitted and unpushed
- Existing branch `cursor/cloud-agent-1786730407571-mctgc` changes only one `AGENTS.md` line and does not contain the staging implementation.
- Do not checkout that Cursor branch or reset `main` without first preserving the working tree.

Remotes:

- `cigar` → `https://github.com/ClGAR/gentrep-academy.git`
- `origin` → `https://github.com/atc1989/gentrep-academy.git`

The owner explicitly prohibited modifying or pushing `origin`.

### Tracked files changed in the current working tree

- `.env.example`
- `.gitignore`
- `AGENTS.md` (pre-existing user/Next-generated change; do not attribute or discard casually)
- `README.md`
- `eslint.config.mjs`
- `package.json`
- `src/app/academy/certificates/[id]/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/verify/[certificateId]/page.tsx`
- `src/components/academy/AcademyDashboard.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/lib/academy/qr.ts`
- `src/lib/academy/queries.ts`
- `src/lib/academy/rules.test.ts`
- `src/lib/academy/types.ts`
- `src/lib/actions/academy.ts`
- `src/lib/env.ts`
- `supabase/seed.sql`

### Untracked implementation files

- `.vercelignore`
- `docs/GENTREP_ACADEMY_PROJECT_BRIEF.md`
- `docs/GENTREP_ACADEMY_CURSOR_HANDOFF_AUDIT_2026-08-15.md`
- `scripts/invite-staging-admin.mjs`
- `scripts/lib/staging-supabase.mjs`
- `scripts/test-progression-concurrency.mjs`
- `scripts/verify-staging.mjs`
- `src/app/auth/setup/page.tsx`
- `src/app/certificates/verify/[certificateCode]/page.tsx`
- `src/components/auth/InviteSetupForm.tsx`
- `supabase/cleanup_mock.sql`
- `supabase/config.toml`
- `supabase/migrations/20260815090000_security_foundation.sql`
- `supabase/migrations/20260815103000_advisor_hardening.sql`
- `supabase/staging_seed.sql`
- `supabase/tests/bootstrap_remote.sql`
- `supabase/tests/database/001_security_foundation.test.sql`

## 7. Applied migration state

Current local/remote migration list is aligned:

| Migration | Remote state | Notes |
| --- | --- | --- |
| `20260813120000_init.sql` | Applied | Immutable; hash preserved |
| `20260815090000_security_foundation.sql` | Applied | Assignment, progression, credit, certificates, role and RLS foundation |
| `20260815103000_advisor_hardening.sql` | Applied | Pins legacy trigger-function search path |

Protected hashes at handoff:

- Initial migration: `5BC5D593FBFB9645AB2F2751BBE2DE5275D3027C2974DA54F884EF7FBFB602C4`
- Chairman HTML: `2B3089EB537C973DE045BA149714A25107FCDFE752354A4281D0989BC1E3A557`

## 8. Current hosted staging state

Read-only verification on 2026-08-15 returned:

| Entity/state | Current value |
| --- | ---: |
| Synthetic profiles | 19 |
| Roles | 2 staff, 3 trainers, 14 members, 1 admin |
| Events | 20 |
| Bookings | 3 |
| Attendance records | 2 |
| Requirement completions | 30 |
| Member-rank progress rows | 23 |
| Certificates | 3 |
| Trainer-credit rows | 1 |

Verified invariants:

- one application role per identity
- existing admin identity has exactly `admin`
- historical primary-trainer credit is preserved after reassignment
- anonymous public certificate verification succeeds
- password Auth sign-in succeeds for the approved admin

Historical reports listed 29 requirement completions. The current count is 30. Do not delete or rewrite data to force the older count; identify the additional synthetic completion first.

## 9. Current Auth configuration and critical drift warning

Hosted staging currently has:

- Site URL set to the final Preview origin
- exact `/auth/setup` redirect allow-listed
- the Preview wildcard and localhost development redirects allow-listed
- global self-signup disabled
- existing-user email/password provider enabled
- email confirmation enabled
- TOTP enabled

Critical operational warning:

`supabase/config.toml` is a local-development configuration. It currently contains a localhost Site URL and disables email signup/provider behavior for local use. A blind `supabase config push` from the repository can overwrite the hosted Site URL, remove the exact redirect, or disable password sign-in.

During the Auth verification work, a CLI workdir mistake briefly pushed those local defaults. The diff exposed the problem immediately; the final Preview Site URL, exact redirect, and hosted email/password provider were restored before sign-in verification. Cursor must not run `supabase config push` until it has read the remote/current Auth contract and intentionally prepared a staging-safe config.

## 10. Verification matrix at handoff

| Check | Current result | Evidence/command | Limitation |
| --- | --- | --- | --- |
| Unit rules | PASS, 12/12 | `npm run test` | Pure domain tests only |
| Database authorization | PASS, 61/61 | `npm run test:db` | Local test DB; hosted matrix also passed earlier |
| Concurrent progression | PASS | `npm run test:db:concurrency` | Requires local Supabase/Docker |
| Full local suite | PASS | `npm run test:all` | Does not cover browser UI |
| Lint | PASS | `npm run lint` | None reported |
| Type check | PASS | `npm run typecheck` | None reported |
| Production build | PASS | `npm run build` | Build is not Production approval |
| Dependency audit | PASS, 0 vulnerabilities | `npm audit --omit=dev --audit-level=high` | Time-sensitive result |
| Hosted migrations | PASS/aligned | `npx supabase migration list --linked` | Staging only |
| Hosted fixture/invariants | PASS | `npm run staging:verify` with target-locked key input | Uses service-role server context for verification |
| Password Auth | PASS | Owner-authorized direct sign-in verification | No browser session exercised |
| Preview deployment | READY/Preview | Vercel inspect | Protected deployment may require a bypass token for CLI HTTP checks |
| Anonymous admin rejection | PASS | HTTP 307 to `/login` | Anonymous only, not an authenticated non-admin |
| Browser admin journey | NOT RUN | Computer Use stopped before interaction | Main remaining acceptance gap |
| Mobile/keyboard/accessibility | NOT RUN | Static form fixes only | Requires real browser/device review |

## 11. Security and privacy audit

- The initial migration and chairman HTML remain unchanged.
- Production Supabase, Vercel Production deployments, the old Vercel project, the `atc1989` remote, and both Obsidian vaults were not modified.
- Two Production-scoped Vercel variables already existed and were inspected read-only; they were not changed or removed.
- Real `.env.local` values remain ignored and were not pushed.
- `.env.example` contains placeholders only.
- No server/service-role credential is browser-exposed or stored in Vercel Preview.
- The final repository scan covered 76 tracked/relevant untracked files and found zero credential files and zero personal-email files; reserved test-domain occurrences were allowed.
- The owner-supplied temporary credential is deliberately absent from this audit. Do not retrieve it from logs or conversation history.
- Supabase Security Advisor previously had no errors. Its remaining non-blocking warning was disabled leaked-password protection; recheck before any release decision.
- Performance Advisor had RLS init-plan and multiple-permissive-policy optimization warnings. These are not current correctness blockers but should be measured before broader rollout.

## 12. Known mistakes, recoveries, and lessons

| Event | Impact | Final disposition | Lesson for Cursor |
| --- | --- | --- | --- |
| First invitation targeted an earlier immutable Preview | Invitation could not complete the new setup route | Exact final redirect allow-listed; one replacement invitation sent | Use a stable staging URL before inviting users |
| Attempt to alias an immutable deployment URL | Vercel rejected the alias | No external state changed | Deployment URLs cannot be repointed as aliases |
| Computer Use could not establish the active Brave URL | Manual browser testing stopped | No UI actions performed | Use a reliable browser automation context or owner-driven browser test |
| Typecheck was run concurrently with build once | Temporary `.next/types` race caused one false failure | Sequential rerun passed | Do not run `next build` and `tsc --noEmit` concurrently |
| Hosted Auth config initially omitted/restored some defaults during configuration work | Confirmations/TOTP briefly drifted | Detected through config diff and restored before invitation | Always inspect full remote Auth diff, not only intended keys |
| Temporary workdir flag was placed incorrectly during Auth verification | Local Site URL/redirect defaults briefly reached staging | Detected immediately and restored; final sign-in passed | Put global CLI flags before subcommands or use an audited staging config |
| Password sign-in initially returned `email_provider_disabled` | Password update succeeded but verification failed | Hosted existing-user email/password provider enabled; global signup remains disabled | Distinguish provider enablement from global self-signup policy |

## 13. Documentation drift at handoff

Corrected in this audit:

- Admin Auth setup is complete, not pending.
- Password sign-in is verified directly against staging Auth.
- Two invitations were sent in total after explicit authorizations; there was no recovery email.
- Current completion count is 30, not 29.

Still intentionally historical:

- The long pre-staging analysis in `GENTREP_ACADEMY_PROJECT_BRIEF.md` describes the repository before the forward migrations. Read its status statements as history unless the staging update confirms them.

Potential future doc repair:

- Split the historical pre-staging audit from the current operational runbook so old `Unable to verify` statements cannot be mistaken for the live staging state.
- Add a hosted-staging Auth configuration runbook that cannot accidentally push local `config.toml` defaults.

## 14. Remaining blocking and non-blocking work

### Blocking before any production claim

- Complete the authenticated browser journey: login, admin route, logout, and expired/invalid-session behavior.
- Prove an authenticated non-admin is rejected from `/admin` in the application, not only at the database layer.
- Exercise member, assigned/unassigned staff, assigned/unassigned trainer, and admin browser journeys against synthetic staging users.
- Complete desktop/mobile and keyboard/accessibility review.
- Perform an explicit production privacy/data-retention and rollout review.

### Non-blocking staging work

- Identify the source of the 30th requirement-completion row.
- Recheck Supabase Security and Performance Advisors.
- Add safe error observability without exposing database internals.
- Consider a stable Preview/staging alias before future invitation flows.
- Resolve the local-versus-hosted Auth config drift with an explicit runbook or separate staging config.

### Deferred product features

- real media/video workflow
- door scanning
- date switching
- notifications
- broader admin management UI
- analytics/reporting beyond current counts
- payments or membership synchronization

Do not implement these without fresh owner approval.

## 15. Recommended next Cursor action

The next focused action is an authenticated staging browser acceptance pass using the existing admin identity, followed by one authenticated non-admin rejection check. Do not change code first. Capture only pass/fail evidence and redact credentials/session tokens.

If browser acceptance exposes a defect, make the smallest repository fix, rerun `npm run test:all`, lint, typecheck, build, and deploy a new Preview only after confirming the selected Vercel project and Preview target.

## 16. Cursor kickoff prompt

Copy this prompt into Cursor after opening `C:\Users\mance\Projects\gentrep-academy`:

```text
Read AGENTS.md, docs/GENTREP_ACADEMY_CURSOR_HANDOFF_AUDIT_2026-08-15.md,
docs/GENTREP_ACADEMY_PROJECT_BRIEF.md, and README.md before acting.

Preserve the current dirty main working tree. Do not reset, checkout the cloud-agent
branch, push, commit, or touch the atc1989 remote unless I explicitly authorize it.
Do not edit the Obsidian vaults, chairman HTML, initial migration, Production Supabase,
Vercel Production, or the old Vercel project. Never print or store credentials.

First perform read-only orientation and confirm the exact repository, Supabase staging
ref qipwvvhmhxqzlmezvjxu, Vercel project prj_0ek2KAWnicjCncMQ3l96Et6aMpFq, and Preview
deployment. Do not run `supabase config push` from the local config.

The immediate task is authenticated browser acceptance only: verify the existing admin
can sign in and reach /admin, then verify one authenticated non-admin cannot reach /admin.
Use synthetic staging identities only. Report evidence and limitations; do not claim
Production readiness or expand scope.
```

## 17. Final handoff status

**Safe to continue in Cursor with restrictions.** The implementation and staging environment are functional, but the local work is uncommitted, hosted Auth configuration differs intentionally from local defaults, and browser acceptance remains incomplete.
