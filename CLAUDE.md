# LumiDoc — Claude Code Instructions

AI-powered Document Q&A application. Single-user portfolio project by Lakshan Weerasinghe.

Full specs: `Documentation/features.md`, `Documentation/tech-spec.md`, `Documentation/roadmap.md`

---

## Stack

| Layer           | Technology                                                          |
| --------------- | ------------------------------------------------------------------- |
| Framework       | Next.js 15 (App Router) via OpenNext on Cloudflare Workers          |
| Language        | TypeScript 5 (strict mode)                                          |
| Styling         | Tailwind CSS 4 + Shadcn/UI                                          |
| Database        | Supabase (PostgreSQL 15 + pgvector + Auth + Storage)                |
| AI — Q&A        | Anthropic `claude-sonnet-4-20250514` via Vercel AI SDK `streamText` |
| AI — Vision/OCR | Anthropic `claude-haiku-4-5`                                        |
| Embeddings      | Voyage AI `voyage-3` (1024 dims)                                    |
| Background jobs | Supabase Edge Functions (Deno)                                      |
| Deployment      | Cloudflare Workers (`*.workers.dev`) via `@opennextjs/cloudflare`   |

---

## Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run preview      # build + run locally in the Workers runtime (wrangler)
npm run deploy       # build + deploy to Cloudflare (CI does this automatically)
```

Pre-commit hook runs `lint-staged` automatically (ESLint + Prettier on staged files).

---

## Branching Strategy

```
main        → production (auto-deploy to Cloudflare Worker `lumidoc`, protected)
develop     → staging (auto-deploy to Cloudflare Worker `lumidoc-staging`)
feature/*   → one branch per feature, PR into develop
hotfix/*    → merge directly to main after review
```

**Feature branch naming:**

| Phase                | Branch name                           |
| -------------------- | ------------------------------------- |
| Auth + DB schema     | `feature/phase-1-auth`                |
| Document processing  | `feature/phase-2-document-processing` |
| RAG + chat UI        | `feature/phase-3-rag-chat`            |
| Advanced chat        | `feature/phase-4-advanced-chat`       |
| Production hardening | `feature/phase-5-hardening`           |
| Launch prep          | `feature/phase-6-launch`              |
| Smaller features     | `feature/<short-description>`         |

**Rules:**

- Never push directly to `main` or `develop`
- Always open a PR from `feature/*` → `develop`
- CI (lint + type-check) must pass before merge
- `develop` → `main` via PR only

---

## Project Structure

```
app/
  (auth)/           # login, register, OAuth callback
  (dashboard)/      # workspace list, document library, chat
  (landing)/        # public landing page
  api/              # chat, documents/upload, conversations
components/
  chat/             # ChatWindow, MessageList, SourcePanel, ChatInput, etc.
  documents/        # UploadZone, DocumentCard, ProcessingStatus
  workspace/        # WorkspaceCard
  ui/               # Shadcn primitives
lib/
  supabase/         # client.ts (browser), server.ts (RSC), middleware.ts
  anthropic/        # client.ts, chat.ts (streamText), vision.ts (OCR)
  voyage/           # client.ts, embed.ts (batch embeddings)
  processors/       # per-filetype extractors (pdf, docx, xlsx, pptx, image, text)
  chunking/         # splitter.ts (512 tokens, 50 overlap)
  retrieval/        # hybrid-search.ts (70% vector + 30% FTS), hyde.ts
  utils.ts          # cn() from Shadcn
supabase/
  migrations/       # numbered SQL migrations
  functions/        # process-document Edge Function (Deno)
types/
  database.ts       # generated Supabase types
  index.ts          # shared app types
env.ts              # Zod-validated env vars — import from here, not process.env
middleware.ts       # Supabase auth session refresh
```

---

## Environment Variables

Validated at startup via `env.ts` (Zod). Always import from `env.ts`, never read `process.env` directly.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Voyage AI
VOYAGE_API_KEY=

# Resend (Phase 6 only)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=LumiDoc
```

---

## Architecture

**RAG Pipeline:**

```
Upload → validate → Supabase Storage → Edge Function (async)
  → text extraction (by file type) → chunk (512t, 50 overlap)
  → Voyage AI embed → pgvector store → status: ready
```

**Query Pipeline:**

```
User query → HyDE enhancement → Voyage AI embed
  → hybrid_search() [70% cosine + 30% FTS, top 6 chunks]
  → build context → claude-sonnet streamText → SSE stream to client
  → persist messages + source refs
```

**Supabase tables:** `user_profiles`, `workspaces`, `documents`, `document_chunks` (VECTOR 1024), `conversations`, `messages`

All tables have RLS enabled. Every API route validates session via Supabase Auth before executing.

---

## CI/CD

Workflow: `.github/workflows/ci.yml`

```
PR → develop/main        → lint + type-check
Push to develop          → lint + type-check → deploy Worker `lumidoc-staging`
Push to main             → lint + type-check → deploy Worker `lumidoc` (production)
```

Deploy = `opennextjs-cloudflare build` → `wrangler deploy --secrets-file` (runtime secrets are uploaded with each version). Config: `wrangler.jsonc`, `open-next.config.ts`.

GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, optional `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
GitHub Variables: `PRODUCTION_URL`, `STAGING_URL` (the `*.workers.dev` URLs; used as `NEXT_PUBLIC_APP_URL`).

Workers runtime notes: un-awaited background work is cancelled once the response is sent — use `after()` from `next/server`. Keep the Worker under the 3 MiB (gzip) free-plan limit; don't import heavy parsers (`lib/processors/*`) from API routes.

---

## Coding Conventions

- TypeScript strict — no `any`, no `as unknown`
- Server components by default; `"use client"` only when needed (event handlers, hooks)
- Supabase browser client (`lib/supabase/client.ts`) in client components only
- Supabase server client (`lib/supabase/server.ts`) in Server Components and API routes
- All API routes: validate session first, then Zod-validate request body
- Streaming chat via Vercel AI SDK `streamText` — do not buffer full response
- File uploads: validate MIME type server-side (not just extension)
- No comments explaining what the code does — only comment non-obvious WHY
- No `console.log` in committed code — use Sentry for error tracking

---

## Roadmap (14 weeks)

| Phase | Weeks | Goal                               |
| ----- | ----- | ---------------------------------- |
| 0     | 1     | Project foundation ✅              |
| 1     | 2–3   | Auth + DB schema + dashboard shell |
| 2     | 4–5   | Document processing pipeline       |
| 3     | 6–7   | RAG engine + chat UI               |
| 4     | 8–9   | Advanced chat features             |
| 5     | 10–11 | Production hardening + testing     |
| 6     | 12    | Launch prep                        |
