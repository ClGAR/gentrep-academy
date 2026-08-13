<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from this repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gentrep Academy

Member training portal. Auth: **email + password**.

# GutGuard — Tech Stack gate

Before scaffolding or changing app architecture, data, auth, deploy, or dependencies:

1. Read the Obsidian GutGuard Tech Stack (synced vault) — **READ ONLY**.
2. Do **not** edit, create, or delete files inside `GutGuard Tech Stack/` or `GutGuard Design System/`. Only the owner (Najee) may change those vaults. Implement in this product repo only.
3. Minimum Tech Stack reads:
   - `GutGuard Tech Stack/00 - OWNER — Read only.md`
   - `GutGuard Tech Stack/00 - GutGuard Tech Stack.md`
   - `GutGuard Tech Stack/01 - Canonical Stack.md`
   - `GutGuard Tech Stack/02 - Supabase Conventions.md`
   - `GutGuard Tech Stack/03 - Frontend Conventions.md`
   - `GutGuard Tech Stack/04 - Deploy and Env.md`
4. Stack defaults: Next.js App Router + TypeScript, Supabase (no ORM), Vercel + npm + ESLint, Zod + React Hook Form, Design System portable CSS — **no Tailwind, no shadcn**.
5. Service role keys: server / Vercel only — never `NEXT_PUBLIC_`.

Local Tech Stack path:
`C:\Users\mance\OneDrive\Documents\GutGuard\GutGuard Tech Stack\`

# GutGuard UI — Design System gate

Before generating or changing any frontend:

1. Read the Obsidian GutGuard Design System — **READ ONLY**. Do not edit that vault.
2. Member dashboard: preserve chairman HTML layout, content, screens, IA, and interactions. Skin with Doctors tokens (commerce dialect).
3. New screens (login, staff, trainer, admin, verify) follow the Design System.
4. Recognition cues: bone `#F4F1EA`, blue `#0608A9`, ink `#0F0F18`, gold `#B08D5B`, Fraunces + Inter Tight, paper grain, uppercase micro-labels.

Local vault path:
`C:\Users\mance\OneDrive\Documents\GutGuard\GutGuard Design System\`
