# Gentrep Academy Obsidian Reconciliation

Date: 2026-08-17  
Status: implementation baseline  
Code baseline: `origin/main` after PR #3

## Authority order

1. **Supabase schema, RLS, RPCs, and stored progress** control working behavior and authorization.
2. **GutGuard Tech Stack** controls architecture, data access, migrations, auth conventions, testing, and deploy hygiene.
3. **GutGuard Design System** controls the visual language and component states.
4. **Chairman Academy HTML** controls the member dashboard structure, screens, IA, responsive shell, and interaction presentation.

The two Obsidian vaults and the chairman HTML are read-only. All implementation belongs in this product repository.

## Canonical source notes

Design System vault:

- `00 - OWNER — Read only.md`
- `00 - GutGuard Design System.md`
- `01 - Visual Foundations.md`
- `03 - Portable CSS Starter.md`
- `04 - Stitch Workflow.md`
- `05 - Playbook.md`
- `07 - Using the DS with Cursor.md`
- `DESIGN.md`
- `Foundations/Dialects.md`
- `Foundations/Breakpoints.md`
- `Systems/Doctors-HTML.md`
- `Systems/Gentrep-Academy-Dashboard.md`
- `Components/Index.md` and the component notes used by this app

Tech Stack vault:

- `00 - OWNER — Read only.md`
- `00 - GutGuard Tech Stack.md`
- `01 - Canonical Stack.md`
- `02 - Supabase Conventions.md`
- `03 - Frontend Conventions.md`
- `04 - Deploy and Env.md`
- `05 - Playbook.md`
- `07 - Using the Tech Stack with Cursor.md`
- `Systems/GEMA.md`
- `Systems/GutGuard-Doctors.md`

## Resolved visual decisions

| Concern | Chairman prototype | Canonical implementation |
|---|---|---|
| Canvas | Cool grey `#eef2f7` | Warm bone `#F4F1EA` with subtle paper grain |
| Raised surface | White | Paper `#FCFAF5` |
| Primary action | `#2569b8` | Ultramarine `#0608A9`; pressed `#04067A` |
| Dark fill/text | Navy | Ink `#0F0F18`; blue reserved for action/emphasis |
| Progress accent | Bright amber | `--gg-gold-soft` on dark surfaces; `--gg-gold` on light surfaces |
| Display type | Anton / Playfair | Fraunces |
| UI type | Inter / Sora | Inter Tight |
| Rank chip type | Anton | Inter Tight 800 uppercase |
| Button focus | Blue ring | 3px muted-gold outline with 3px offset |
| Done state | Prototype green | Product-scoped `--gg-good`, pending DS-owner finalization |
| Telegram | Teal system color | Allowed only on the 42px channel tile |
| Rank metals | Bronze/silver/gold artwork | Academy system-special; retained |

## Per-surface dialects

| Surface | Dialect | Required treatment |
|---|---|---|
| Member Academy | Commerce | Chairman shell and IA, Doctors tokens and typography |
| Login / invitation setup | Commerce | Auth card, boxed fields, rounded controls |
| Admin / staff / trainer | Admin | Square hero, tabs/navigation, ruled panels and tables |
| Public certificate verification | Editorial | Square verification panel and ceremonial hierarchy |
| Certificate artwork | Academy system-special | Fraunces, ink/blue rules, print-safe paper, white QR quiet zone |

## Gap matrix

### Mandatory visual remaps

- `src/app/academy/layout.tsx` loads four prototype fonts instead of the root Fraunces/Inter Tight pair.
- `src/app/academy/academy.css` and `src/components/academy/tokens.ts` still contain the complete chairman palette.
- Academy focus, disabled, loading, success, warning, and error states do not consistently use canonical DS semantics.
- Member dialogs use the correct responsive sheet behavior but not the canonical commerce dialog chrome.
- Operations pages use minimal DS primitives but lack the documented Admin Shell, status badges, responsive table wrapper, and surfaced action feedback.
- Public verification uses generic auth-card chrome instead of the editorial verification dialect.

### Structure to preserve

- Desktop sticky sidebar at `>=900px`, mobile masthead/rank ladder below `900px`.
- Mobile main column near 440px; desktop shell near 1240px.
- Sticky mobile “Next” bar paired with the desktop sidebar CTA.
- Activation plate, requirement timeline, inline event rows, document/about sheets, chat link, certificate, toast, and confetti.
- BASE → TL → SL → PL → CC rank sequence and insignia artwork.

### Frontend workflow/content adjustments

- Keep **Cancel first** before rebooking: the current RPC forbids a second active booking and no atomic switch RPC exists.
- Remove About copy that promises no-cancel switching, automatic notifications, or member-visible scan behavior not implemented by the app.
- Present documents honestly: the client records “reviewed” before agreement; it does not prove media playback.
- Surface staff/trainer action errors instead of refreshing silently.
- Preserve real opaque certificate verification URLs and real QR codes; do not restore prototype ggverse/reference-code URLs.
- Keep demo completion controls behind the non-production chairman preview.

### Backend-dependent, intentionally unchanged

- RLS remains the authorization boundary; route guards and hidden navigation remain supplemental.
- Rank progress comes from `member_rank_progress`; requirement state comes from `requirement_completions` and bookings.
- Members cannot self-record attendance, trainer sign-off, derived credit, roles, or certificate corrections.
- Staff remain scoped to assigned events; trainers remain scoped to active assignments.
- Certificate issuance remains sequential, idempotent, auto-audited, and publicly verifiable only by opaque code.

### Owner decisions / product-local resolutions

- Academy component notes are Draft. This reconciliation treats the owner request as approval to apply them in this product only.
- The existing scoped success green remains product-local until the Design System owner finalizes a canonical success token.
- Academy pips/progress remain system-specific rather than being forced into the booth Progress Rail.
- No new top bar is introduced for the member shell; admin surfaces use horizontal operations navigation.

## Backend revision decision

No Obsidian rule requires a schema, RLS, RPC, role, or data revision for this reconciliation. Existing migrations remain untouched.

If a future approved requirement needs persistence or atomicity, it must use:

1. a new forward migration under `supabase/migrations/`;
2. updated TypeScript DTOs, queries, schemas, and server actions;
3. pgTAP authorization tests and concurrency tests where applicable;
4. non-admin RLS verification before deployment.

## Verification contract

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Responsive browser checks at 1440px, 900px, 390px, and 320px
- Keyboard/focus/Escape checks
- Reduced-motion and safe-area checks
- Anonymous redirects and public certificate verification
- Authenticated member, staff, trainer, and admin workflow checks when role fixtures are available

