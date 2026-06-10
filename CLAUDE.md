# LumiDoc — Claude Code Instructions

AI-powered Document Q&A application. Single-user portfolio project by Lakshan Weerasinghe.

Full specs: `Documentation/features.md`, `Documentation/tech-spec.md`, `Documentation/roadmap.md`

---

## Stack

| Layer           | Technology                                                          |
| --------------- | ------------------------------------------------------------------- |
| Framework       | Next.js 15 (App Router, edge runtime)                               |
| Language        | TypeScript 5 (strict mode)                                          |
| Styling         | Tailwind CSS 4 + Shadcn/UI                                          |
| Database        | Supabase (PostgreSQL 15 + pgvector + Auth + Storage)                |
| AI — Q&A        | Anthropic `claude-sonnet-4-20250514` via Vercel AI SDK `streamText` |
| AI — Vision/OCR | Anthropic `claude-haiku-4-5`                                        |
| Embeddings      | Voyage AI `voyage-3` (1024 dims)                                    |
| Background jobs | Supabase Edge Functions (Deno)                                      |
| Deployment      | Vercel                                                              |

---

## Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

Pre-commit hook runs `lint-staged` automatically (ESLint + Prettier on staged files).

---

## Branching Strategy

```
main        → production (auto-deploy to Vercel, protected)
develop     → staging (Vercel preview)
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

```
Push to develop / PR     → lint + type-check → preview deploy (Vercel)
PR merged into main      → lint + type-check → production deploy (Vercel)
```

Preview URL is auto-commented on every PR.

GitHub Secrets required: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

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
