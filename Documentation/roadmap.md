# LumiDoc — Development Roadmap

> Version: 1.0  
> Stack: Next.js 15 · Supabase · Anthropic Claude · Voyage AI · Vercel  
> Total Estimated Duration: ~12 weeks to Production-ready v1.0

---

## Roadmap Overview

```
Phase 0  │ Week 1      │ Project Foundation & Dev Environment        ✅ DONE
Phase 1  │ Week 2–3    │ Core Infrastructure (Auth + Storage + DB)   ✅ DONE
Phase 2  │ Week 4–5    │ Document Processing Pipeline                ✅ DONE
Phase 3  │ Week 6–7    │ RAG Engine + Chat Interface                 ⬜ NEXT
Phase 4  │ Week 8–9    │ Advanced Chat Features                      ⬜ PENDING
Phase 5  │ Week 10–11  │ Production Hardening & Performance          ⬜ PENDING
Phase 6  │ Week 12     │ Launch Prep & Public Release                ⬜ PENDING
```

---

## Phase 0 — Project Foundation ✅

**Duration:** Week 1  
**Goal:** Dev environment, repo structure, tooling, design system ready.

### Tasks

- [x] Initialise Next.js 15 project (App Router, TypeScript strict mode)
- [x] Configure ESLint + Prettier + Husky pre-commit hooks
- [x] Set up GitHub repository with branch strategy (`main`, `develop`, feature branches)
- [x] Configure GitHub Actions CI: lint + type-check on every PR
- [x] Set up Supabase project (local dev with Supabase CLI)
- [x] Configure Vercel project with preview deployments on PRs
- [x] Install and configure Tailwind CSS + Shadcn/UI
- [x] Set up environment variable schema with `zod` validation (`env.ts`)
- [x] Create project folder structure (see Tech Spec)
- [x] Set up Sentry for error tracking
- [x] Configure Vercel Analytics + Speed Insights
- [x] Write base `README.md` with setup instructions

### Deliverables

- [x] Deployable "hello world" on Vercel preview URL
- [x] Supabase project with local dev running
- [x] CI passing on GitHub Actions

---

## Phase 1 — Core Infrastructure ✅

**Duration:** Week 2–3  
**Goal:** Auth, user management, workspace model, and base UI shell working end-to-end.

### Week 2 — Authentication & Database Schema

- [x] Implement Supabase Auth: email/password + Google OAuth
- [x] Magic link login flow
- [x] Email verification on sign-up
- [x] Auth middleware for protected routes (`middleware.ts`)
- [x] Create all Supabase database migrations:
  - `user_profiles` table
  - `workspaces` table
- [x] Enable Row-Level Security (RLS) on all tables
- [x] Write RLS policies for user data isolation

### Week 3 — Dashboard Shell & Workspace UI

- [x] Landing page (hero, features, demo CTA)
- [x] Dashboard layout: sidebar + main content area
- [x] Workspace list page (create, rename, delete)
- [x] User profile page (display name, avatar, email)
- [x] Mobile-responsive nav and sidebar

### Deliverables

- [x] Auth flows working (sign up, login, logout, Google OAuth)
- [x] Dashboard shell rendered post-login
- [x] Workspace CRUD working

---

## Phase 2 — Document Processing Pipeline ✅

**Duration:** Week 4–5  
**Goal:** Upload any file type, extract text, chunk, embed, and store in pgvector — full pipeline working.

### Week 4 — Upload & Text Extraction

- [x] Create `documents` and `document_chunks` Supabase tables
- [x] Enable `pgvector` extension in Supabase
- [x] Create vector column (`VECTOR(1024)`) on `document_chunks`
- [x] Build file upload UI (drag-and-drop, multi-file, progress bar)
- [x] `POST /api/documents/upload` API route:
  - Validate file type and size
  - Upload raw file to Supabase Storage (private bucket)
  - Create `document` record with status `processing`
  - Trigger Supabase Edge Function for processing
- [x] Text extraction per file type:
  - PDF: `pdf-parse` v2
  - DOCX: `mammoth`
  - TXT / MD / code files: direct read
  - XLSX / CSV: `SheetJS` → Markdown table conversion
  - PPTX: slide extraction via JSZip XML parsing
  - Images (PNG/JPG/WEBP): `claude-haiku-4-5` Vision API

### Week 5 — Chunking, Embedding & Indexing

- [x] Implement recursive character text splitter (512 tokens, 50 overlap)
- [x] Inject metadata into each chunk (document ID, chunk index)
- [x] Call Voyage AI `voyage-3` API to generate 1024-dim embeddings
- [x] Store chunks + embeddings in `document_chunks` table
- [x] Create IVFFlat index on embedding column
- [x] Update document status to `ready` on completion
- [x] Error handling: failed documents set to `error` status with reason
- [x] Retry mechanism (3 attempts with exponential backoff)
- [x] Document library UI (grid view, status badges, live polling)
- [ ] Document detail panel (metadata, chunk count, preview) ← Phase 3 সময় add කළ හැකිය
- [ ] Document search / filter ← Phase 3 সময় add කළ හැකිය

### Deliverables

- [x] Upload any supported file → processing complete → chunks + embeddings in DB
- [x] Document library page showing all uploads with status
- [x] Edge Function `process-document` deployed to Supabase

---

## Phase 3 — RAG Engine + Chat Interface

**Duration:** Week 6–7  
**Goal:** Full chat-with-document experience working with streaming responses, source attribution, and conversation history.

### Week 6 — Retrieval & Generation Engine

- [ ] Create `conversations` and `messages` tables in Supabase
- [ ] Implement hybrid search function in Supabase (pgvector cosine + full-text):
  ```sql
  CREATE FUNCTION hybrid_search(query_embedding VECTOR, query_text TEXT, doc_ids UUID[])
  ```
- [ ] Build query pipeline:
  1. Embed user query via Voyage AI
  2. Run hybrid search → top 6 chunks
  3. Build context window with retrieved chunks
  4. Call Claude `claude-sonnet-4-20250514` with system prompt + context + query
- [ ] Implement HyDE (Hypothetical Document Embedding) for better retrieval
- [ ] Streaming response via Vercel AI SDK `streamText`
- [ ] Source attribution: attach chunk references to each assistant message

### Week 7 — Chat UI

- [ ] Chat interface layout (message list + input box + source panel)
- [ ] Real-time streaming rendering (token-by-token)
- [ ] Markdown rendering in responses (`react-markdown` + code highlighting)
- [ ] Source citation panel (expandable, shows retrieved chunk + relevance score)
- [ ] Conversation sidebar (history list, rename, delete, pin)
- [ ] Follow-up question suggestions (3 AI-generated suggestions after each response)
- [ ] Copy response button, regenerate button, thumbs up/down feedback
- [ ] Empty state and onboarding hints

### Deliverables

- Full RAG chat loop working end-to-end
- Source attribution visible in UI
- Conversation history persisted in Supabase

---

## Phase 4 — Advanced Chat Features

**Duration:** Week 8–9  
**Goal:** Multi-document mode, workspace-wide queries, AI behaviour controls, and conversation export.

### Week 8 — Multi-Document & Workspace Mode

- [ ] Multi-document chat: user selects multiple docs for a single query
- [ ] Cross-document retrieval with per-document source attribution
- [ ] Workspace-wide query mode (searches all documents)
- [ ] AI response language control (per workspace setting)
- [ ] Response style selector: Concise / Detailed / Bullet points
- [ ] Strict mode toggle (refuse answers not in documents)

### Week 9 — Conversation Polish

- [ ] Conversation export: Markdown + PDF
- [ ] Search conversation history by keyword
- [ ] Document tags: add, filter, bulk assign
- [ ] Workspace archive (read-only mode)
- [ ] Workspace settings page (AI behaviour defaults)

### Deliverables

- Multi-document queries working with merged source attribution
- Workspace-wide query mode functional
- Conversations exportable as Markdown and PDF

---

## Phase 5 — Production Hardening

**Duration:** Week 10–11  
**Goal:** Performance, security, testing, monitoring — production-ready.

### Week 10 — Testing

- [ ] Unit tests with Vitest:
  - Text extraction functions (all file types)
  - Chunking function
  - Hybrid search scoring
- [ ] Integration tests: upload → process → query pipeline
- [ ] E2E tests with Playwright:
  - Auth flows (signup, login, OAuth)
  - Upload document → query → receive answer
  - Multi-document query
- [ ] Load testing: `k6` — 50 concurrent users uploading + querying
- [ ] Reach ≥ 80% test coverage on core lib functions

### Week 11 — Performance & Security Audit

- [ ] Lighthouse audit: achieve ≥ 90 Performance, ≥ 95 Accessibility
- [ ] Image optimisation (next/image for all assets)
- [ ] Input validation on all API routes (Zod schemas)
- [ ] File upload security: MIME type validation, file size enforcement at Edge
- [ ] CORS configuration for API routes
- [ ] Supabase RLS audit — test all policies for user isolation
- [ ] Dependency vulnerability scan (`npm audit`)
- [ ] GDPR: implement data export + account deletion endpoints

### Deliverables

- ≥ 80% test coverage on core functions
- Lighthouse ≥ 90 on all key pages
- Security audit checklist complete

---

## Phase 6 — Launch Prep

**Duration:** Week 12  
**Goal:** Portfolio-ready public launch.

### Tasks

- [ ] Production Supabase project (separate from dev)
- [ ] Custom domain + SSL on Vercel
- [ ] Set up Resend for transactional emails:
  - Welcome email
  - Document ready notification
- [ ] Create onboarding flow (3-step checklist for new users)
- [ ] Write full `README.md` with architecture diagram, setup guide
- [ ] Record demo video (2–3 min) for portfolio
- [ ] Set up status page (BetterUptime or similar)
- [ ] Configure Sentry alerts for production errors
- [ ] Final QA pass across all devices (mobile, tablet, desktop)

### Deliverables

- Live production URL
- Portfolio case study page updated at lakshanweerasinghe.com
- Demo video published

---

## Post-Launch Backlog (v1.1+)

| Feature                               | Priority | Est. Effort |
| ------------------------------------- | -------- | ----------- |
| Browser extension (save to workspace) | High     | 2 weeks     |
| Google Drive / Notion sync            | High     | 2 weeks     |
| One-click document summariser         | Medium   | 3 days      |
| Voice input (Web Speech API)          | Low      | 1 week      |
| German + French UI i18n               | Medium   | 1 week      |
| Slack bot integration                 | Low      | 1.5 weeks   |

---

## Dependencies & Risk Register

| Risk                                        | Likelihood | Mitigation                                     |
| ------------------------------------------- | ---------- | ---------------------------------------------- |
| Voyage AI rate limits during bulk embedding | Medium     | Queue with exponential backoff, batch requests |
| Large file timeouts on Vercel (60s limit)   | High       | Use Supabase Edge Functions for processing     |
| Scanned PDF extraction quality              | Medium     | Claude Vision fallback + user notification     |
| pgvector query speed at scale               | Medium     | IVFFlat index + query result caching (Redis)   |
| Anthropic API outage                        | Low        | Graceful error UI + retry with back-off        |
