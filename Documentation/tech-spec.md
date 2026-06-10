# LumiDoc — Technical Specification

> Version: 1.0  
> Status: Pre-development  
> Last updated: 2026

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│          Next.js 15 App Router + React + Tailwind CSS            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    NEXT.JS API ROUTES (Vercel)                    │
│         /api/documents   /api/chat   /api/conversations          │
└──────┬──────────────────────────────────────────────────────────┘
       │
┌──────▼──────────┐   ┌──────────────────────────────────────────┐
│  ANTHROPIC API  │   │               SUPABASE                    │
│  claude-sonnet  │   │  PostgreSQL + pgvector + Auth + Storage   │
│  claude-haiku   │   │  Edge Functions + Realtime                │
│  (Vision)       │   └──────────────────────────────────────────┘
└─────────────────┘
       │
┌──────▼──────────┐
│  VOYAGE AI API  │
│  voyage-3       │
│  Embeddings     │
└─────────────────┘
```

### Architecture Decisions

| Decision   | Choice                     | Reason                                                          |
| ---------- | -------------------------- | --------------------------------------------------------------- |
| Rendering  | App Router (RSC)           | Server components reduce client JS; layouts for auth boundaries |
| Embeddings | Voyage AI voyage-3         | Anthropic-backed; 1024-dim; best-in-class retrieval quality     |
| Vector DB  | Supabase pgvector          | Keeps data in one place; avoids Pinecone cost; RLS support      |
| Streaming  | Vercel AI SDK `streamText` | Native Next.js support; handles backpressure                    |
| Processing | Supabase Edge Functions    | Avoids Vercel 60s timeout on large file processing              |

---

## 2. Tech Stack

### Frontend

| Layer      | Technology                                  | Version           |
| ---------- | ------------------------------------------- | ----------------- |
| Framework  | Next.js                                     | 15.x (App Router) |
| Language   | TypeScript                                  | 5.x (strict mode) |
| Styling    | Tailwind CSS                                | 4.x               |
| Components | Shadcn/UI                                   | Latest            |
| AI Stream  | Vercel AI SDK (`ai` package)                | 4.x               |
| Markdown   | react-markdown + rehype-highlight           | Latest            |
| Forms      | React Hook Form + Zod                       | Latest            |
| State      | Zustand (client) + TanStack Query (server)  | Latest            |
| Testing    | Vitest + React Testing Library + Playwright | Latest            |

### Backend / Infrastructure

| Layer           | Technology               | Notes                         |
| --------------- | ------------------------ | ----------------------------- |
| API             | Next.js API Routes       | Edge runtime where possible   |
| Database        | Supabase (PostgreSQL 15) | pgvector extension enabled    |
| Auth            | Supabase Auth            | JWT, OAuth, magic link        |
| Storage         | Supabase Storage         | Private bucket per user       |
| Background Jobs | Supabase Edge Functions  | Deno runtime                  |
| Deployment      | Vercel                   | Edge network, preview deploys |
| Monitoring      | Sentry                   | Error tracking                |
| Analytics       | Vercel Analytics         | Page views, Core Web Vitals   |
| Emails          | Resend                   | Transactional emails          |

### AI / ML

| Service                              | Usage                                  |
| ------------------------------------ | -------------------------------------- |
| Anthropic `claude-sonnet-4-20250514` | Primary Q&A generation + streaming     |
| Anthropic `claude-haiku-4-5`         | Image/scanned PDF OCR (cost-efficient) |
| Voyage AI `voyage-3`                 | Document + query embedding (1024 dims) |

---

## 3. Project Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts          # OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + auth guard
│   │   ├── page.tsx              # Workspace list
│   │   ├── workspace/
│   │   │   └── [workspaceId]/
│   │   │       ├── page.tsx      # Document library
│   │   │       └── chat/
│   │   │           ├── page.tsx  # New conversation
│   │   │           └── [conversationId]/
│   │   │               └── page.tsx
│   │   └── settings/
│   │       └── page.tsx          # Profile settings
│   ├── api/
│   │   ├── documents/
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── [documentId]/
│   │   │       └── route.ts
│   │   ├── chat/
│   │   │   └── route.ts          # Streaming chat endpoint
│   │   └── conversations/
│   │       └── [conversationId]/
│   │           └── route.ts
│   ├── (landing)/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # Shadcn components
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── SourcePanel.tsx
│   │   ├── SuggestionChips.tsx
│   │   └── ChatInput.tsx
│   ├── documents/
│   │   ├── UploadZone.tsx
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentList.tsx
│   │   └── ProcessingStatus.tsx
│   └── workspace/
│       └── WorkspaceCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (RSC)
│   │   └── middleware.ts
│   ├── anthropic/
│   │   ├── client.ts
│   │   ├── chat.ts               # streamText wrapper
│   │   └── vision.ts             # Image OCR
│   ├── voyage/
│   │   ├── client.ts
│   │   └── embed.ts              # Batch embedding util
│   ├── processors/
│   │   ├── index.ts              # Router by file type
│   │   ├── pdf.ts
│   │   ├── docx.ts
│   │   ├── xlsx.ts
│   │   ├── pptx.ts
│   │   ├── image.ts
│   │   └── text.ts
│   ├── chunking/
│   │   └── splitter.ts
│   ├── retrieval/
│   │   ├── hybrid-search.ts
│   │   └── hyde.ts
│   └── utils/
│       ├── env.ts                # Validated env vars (Zod)
│       └── cn.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_enable_pgvector.sql
│   │   ├── 003_rls_policies.sql
│   │   └── 004_functions.sql
│   └── functions/
│       └── process-document/
│           └── index.ts
├── types/
│   ├── database.ts               # Generated Supabase types
│   └── index.ts
├── middleware.ts
└── env.ts
```

---

## 4. Database Schema

### Enable Extensions

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Tables

```sql
-- ─────────────────────────────────────────────
-- USER PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- WORKSPACES
-- ─────────────────────────────────────────────
CREATE TABLE workspaces (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_archived  BOOLEAN DEFAULT FALSE,
  settings     JSONB DEFAULT '{"response_style": "detailed", "strict_mode": false}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────
CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by    UUID NOT NULL REFERENCES auth.users(id),
  name           TEXT NOT NULL,
  file_type      TEXT NOT NULL,
  mime_type      TEXT,
  file_size      BIGINT,
  storage_path   TEXT NOT NULL,
  status         TEXT DEFAULT 'processing'
                   CHECK (status IN ('processing', 'ready', 'error')),
  error_message  TEXT,
  chunk_count    INT DEFAULT 0,
  sha256_hash    TEXT,                   -- duplicate detection
  tags           TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DOCUMENT CHUNKS (+ vectors)
-- ─────────────────────────────────────────────
CREATE TABLE document_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  chunk_index  INT NOT NULL,
  token_count  INT,
  metadata     JSONB DEFAULT '{}',       -- page_number, section, etc.
  embedding    VECTOR(1024),             -- voyage-3 dimensions
  ts_content   TSVECTOR                  -- full-text search column
                 GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index
CREATE INDEX document_chunks_embedding_idx
  ON document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Full-text search index
CREATE INDEX document_chunks_ts_idx
  ON document_chunks USING GIN (ts_content);

-- ─────────────────────────────────────────────
-- CONVERSATIONS
-- ─────────────────────────────────────────────
CREATE TABLE conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title          TEXT,
  document_ids   UUID[] DEFAULT '{}',    -- which docs scoped to this conversation
  is_pinned      BOOLEAN DEFAULT FALSE,
  is_archived    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  sources          JSONB DEFAULT '[]',   -- [{chunk_id, document_name, score, snippet}]
  feedback         TEXT CHECK (feedback IN ('positive', 'negative')),
  tokens_used      INT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- User profiles: own row only
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profile_update" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- Workspaces: owner only
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_select" ON workspaces FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "workspace_insert" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspace_update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspace_delete" ON workspaces FOR DELETE USING (owner_id = auth.uid());

-- Documents: accessible to workspace owner
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_select" ON documents FOR SELECT
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "document_insert" ON documents FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "document_delete" ON documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- Apply similar owner-scoped policies to document_chunks, conversations, messages
```

### Database Functions

```sql
-- Hybrid search function (vector + full-text)
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding VECTOR(1024),
  query_text      TEXT,
  target_doc_ids  UUID[],
  match_count     INT DEFAULT 6
)
RETURNS TABLE (
  chunk_id       UUID,
  document_id    UUID,
  content        TEXT,
  metadata       JSONB,
  vector_score   FLOAT,
  text_score     FLOAT,
  hybrid_score   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT
      id,
      document_id,
      content,
      metadata,
      1 - (embedding <=> query_embedding) AS v_score
    FROM document_chunks
    WHERE document_id = ANY(target_doc_ids)
    ORDER BY embedding <=> query_embedding
    LIMIT 20
  ),
  text_results AS (
    SELECT
      id,
      ts_rank(ts_content, websearch_to_tsquery(query_text)) AS t_score
    FROM document_chunks
    WHERE document_id = ANY(target_doc_ids)
      AND ts_content @@ websearch_to_tsquery(query_text)
    LIMIT 20
  )
  SELECT
    vr.id,
    vr.document_id,
    vr.content,
    vr.metadata,
    vr.v_score,
    COALESCE(tr.t_score, 0),
    (vr.v_score * 0.7 + COALESCE(tr.t_score, 0) * 0.3) AS hybrid
  FROM vector_results vr
  LEFT JOIN text_results tr ON tr.id = vr.id
  ORDER BY hybrid DESC
  LIMIT match_count;
END;
$$;
```

---

## 5. File Processing Pipeline

```
File Upload
    │
    ▼
[1] Validate (type, size, MIME, SHA-256 duplicate check)
    │
    ▼
[2] Upload to Supabase Storage → /documents/{user_id}/{doc_id}/original.*
    │
    ▼
[3] Create document record (status: "processing")
    │
    ▼
[4] Trigger Supabase Edge Function (async)
    │
    ├─ PDF        → pdfjs-dist text extraction
    │               └─ if no text layer → Claude claude-haiku-4-5 Vision OCR (per page)
    │
    ├─ DOCX       → mammoth.extractRawText()
    │
    ├─ XLSX/CSV   → SheetJS → each sheet → Markdown table string
    │
    ├─ PPTX       → slide-by-slide text extraction
    │
    ├─ Images     → Claude claude-haiku-4-5 Vision → description + OCR text
    │
    └─ TXT/MD/Code → direct utf-8 read
    │
    ▼
[5] Recursive character splitter (512 tokens, 50 overlap)
    - Inject metadata: { document_id, page_number, chunk_index, file_type }
    │
    ▼
[6] Voyage AI voyage-3 batch embedding (max 128 chunks per request)
    │
    ▼
[7] Bulk insert chunks + embeddings into document_chunks
    │
    ▼
[8] Update document status → "ready", set chunk_count
    │
    ▼
[9] Emit Supabase Realtime event → client updates status badge
```

### Edge Function: `process-document`

```typescript
// supabase/functions/process-document/index.ts

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const BATCH_SIZE = 128; // Voyage AI max batch size

serve(async (req) => {
  const { documentId } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. Fetch document record + download from storage
    // 2. Route to correct text extractor
    // 3. Chunk extracted text
    // 4. Embed chunks via Voyage AI in batches
    // 5. Bulk insert into document_chunks
    // 6. Update document status = 'ready'
  } catch (error) {
    // Update document status = 'error', set error_message
  }
});
```

---

## 6. RAG Query Pipeline

```
User Query (string)
    │
    ▼
[1] Query Enhancement
    ├─ Conversation history (last 3 turns) injected for context
    └─ HyDE: generate hypothetical answer → embed that for better retrieval
    │
    ▼
[2] Embed query via Voyage AI voyage-3 (1024 dims)
    │
    ▼
[3] hybrid_search() → top 6 chunks
    (70% vector cosine + 30% full-text rank)
    │
    ▼
[4] Build context string from retrieved chunks
    │
    ▼
[5] Construct Claude prompt:
    SYSTEM:
      "You are a helpful AI assistant. Answer questions based ONLY on the
       provided document context. If the answer is not in the context, say
       so clearly. Cite source sections when possible."

    USER:
      <context>
        [Chunk 1: document_name, page X] ...
        [Chunk 2: document_name, page Y] ...
      </context>

      Question: {user_query}
    │
    ▼
[6] Call claude-sonnet-4-20250514 via Vercel AI SDK streamText()
    │
    ▼
[7] Stream response tokens to client (Server-Sent Events)
    │
    ▼
[8] On stream complete:
    - Persist user message + assistant message to messages table
    - Attach source chunk references to assistant message
```

### Chat API Route

```typescript
// app/api/chat/route.ts

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { hybridSearch } from "@/lib/retrieval/hybrid-search";
import { embedQuery } from "@/lib/voyage/embed";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, documentIds, conversationId } = await req.json();

  const lastUserMessage = messages[messages.length - 1].content;

  // Embed query
  const queryEmbedding = await embedQuery(lastUserMessage);

  // Retrieve relevant chunks
  const chunks = await hybridSearch({
    embedding: queryEmbedding,
    queryText: lastUserMessage,
    documentIds,
    matchCount: 6,
  });

  // Build context
  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.documentName}]\n${c.content}`)
    .join("\n\n---\n\n");

  // Stream response
  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are a helpful document Q&A assistant. Answer using ONLY the provided context. Always cite the source.`,
    messages: [
      { role: "user", content: `<context>\n${context}\n</context>\n\n${lastUserMessage}` },
    ],
    onFinish: async ({ text }) => {
      await persistMessages({
        conversationId,
        userMessage: lastUserMessage,
        assistantMessage: text,
        sources: chunks,
      });
    },
  });

  return result.toDataStreamResponse();
}
```

---

## 7. API Endpoints

### Document Endpoints

| Method | Path                        | Auth     | Description                 |
| ------ | --------------------------- | -------- | --------------------------- |
| POST   | `/api/documents/upload`     | Required | Upload + trigger processing |
| GET    | `/api/documents/:id`        | Required | Get document metadata       |
| DELETE | `/api/documents/:id`        | Required | Delete document + chunks    |
| GET    | `/api/documents/status/:id` | Required | Poll processing status      |

### Chat Endpoints

| Method | Path                              | Auth     | Description           |
| ------ | --------------------------------- | -------- | --------------------- |
| POST   | `/api/chat`                       | Required | Streaming chat (SSE)  |
| POST   | `/api/conversations`              | Required | Create conversation   |
| GET    | `/api/conversations/:id/messages` | Required | Fetch message history |
| DELETE | `/api/conversations/:id`          | Required | Delete conversation   |

---

## 8. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Voyage AI (embeddings)
VOYAGE_API_KEY=

# Resend (emails)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=LumiDoc
```

---

## 9. Security Checklist

- [ ] All API routes validate session via Supabase Auth before executing
- [ ] File uploads: MIME type validated server-side (not just extension)
- [ ] File uploads: max size enforced at Edge middleware (not just client)
- [ ] Supabase Storage: documents in private buckets, accessed via signed URLs (1h expiry)
- [ ] Zod schema validation on all API request bodies
- [ ] RLS enabled on every Supabase table
- [ ] CORS restricted to known origins in `next.config.ts`
- [ ] User-submitted content never executed (no `eval`, no innerHTML)
- [ ] `X-Content-Type-Options: nosniff` header set
- [ ] GDPR: `DELETE /api/user/data` wipes all user records + storage

---

## 10. Deployment Architecture

```
GitHub (main branch push)
         │
         ▼
  GitHub Actions CI
    - npm run lint
    - npm run type-check
    - npx vitest run
         │
         ▼ (if passing)
     Vercel Deploy
    (production domain)
         │
    ┌────┴────────────────────────────┐
    │     Vercel Edge Network          │
    │  - API Routes (edge runtime)     │
    │  - Static assets CDN             │
    └────────────────────────────────┘
         │
    Supabase (production project)
    - PostgreSQL + pgvector
    - Supabase Auth
    - Supabase Storage
    - Edge Functions (document processing)
```

### Branching Strategy

```
main          → production (auto-deploy to Vercel)
develop       → staging (Vercel preview)
feature/*     → PR previews (Vercel preview URL per PR)
hotfix/*      → merge directly to main after review
```

---

## 11. Chunking Configuration

| File Type     | Chunk Size      | Overlap | Strategy                          |
| ------------- | --------------- | ------- | --------------------------------- |
| PDF (text)    | 512 tokens      | 50      | Recursive character splitter      |
| PDF (scanned) | 1 page          | 0       | Per-page Claude Vision extraction |
| DOCX          | 512 tokens      | 50      | Recursive, heading-aware          |
| XLSX/CSV      | 1 sheet section | 0       | Table block (max 50 rows/chunk)   |
| PPTX          | 1 slide         | 0       | Slide = 1 chunk                   |
| Images        | 1 image         | 0       | Vision response = 1 chunk         |
| Code files    | 512 tokens      | 100     | Function/class boundary aware     |
| TXT/MD        | 512 tokens      | 50      | Recursive character splitter      |
