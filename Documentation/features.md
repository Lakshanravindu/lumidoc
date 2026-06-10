# LumiDoc — Feature Specification

> AI-Powered Document Q&A Application  
> Stack: Next.js · Supabase · Anthropic Claude · Voyage AI · Vercel  
> Version: 1.0  
> Status: Pre-development

---

## 1. Overview

LumiDoc is a single-user document intelligence application that allows you to upload documents of any type and have intelligent, context-aware conversations with their content using Anthropic Claude. The platform is built on Retrieval-Augmented Generation (RAG) architecture with Supabase pgvector for semantic search.

**Target Users:**

- Portfolio showcase for technical recruiters and collaborators
- Personal productivity: knowledge workers, researchers, analysts
- Students and developers querying their own document libraries

---

## 2. Authentication & User Management

### 2.1 Auth Flows

- Email + password registration with email verification
- Google OAuth (one-click sign-in)
- Magic link (passwordless login)
- Forgot password + reset flow
- Session persistence (remember me)

### 2.2 User Profile

- Display name, avatar upload
- Email change with verification
- Password change
- Account deletion with data wipe

---

## 3. Workspaces

Workspaces are logical containers that group related documents and conversations. Each user can have multiple workspaces.

### 3.1 Workspace Management

- Create, rename, and delete workspaces
- Workspace-level settings (default AI behaviour, language)
- Document count and storage usage per workspace
- Archive workspaces (read-only, storage preserved)

---

## 4. Document Management

### 4.1 Supported File Types

| Category      | Formats                     | Extraction Method             |
| ------------- | --------------------------- | ----------------------------- |
| Documents     | PDF, DOCX, TXT, MD, RTF     | Text extraction + chunking    |
| Spreadsheets  | XLSX, XLS, CSV, TSV         | Table-to-text conversion      |
| Presentations | PPTX, PPT                   | Slide-by-slide extraction     |
| Images        | PNG, JPG, JPEG, WEBP, GIF   | Claude Vision (OCR + context) |
| Code          | JS, TS, PY, JSON, YAML, SQL | Direct text + syntax context  |

### 4.2 Upload Features

- Drag-and-drop upload area
- Multi-file batch upload (up to 10 files at once)
- Upload progress indicator with per-file status
- Automatic file type detection and validation
- Duplicate file detection (SHA-256 hash check)
- Processing status: `Uploading → Processing → Indexing → Ready`

### 4.3 Document Library

- Grid and list view toggle
- Search documents by name, content preview, or tag
- Filter by file type, date, processing status
- Sort by name, upload date, file size, last queried
- Bulk actions: delete, move to workspace, export

### 4.4 Document Details Panel

- File metadata (name, type, size, upload date)
- Processing stats (chunk count, embedding count)
- Last queried timestamp
- Conversation count linked to this document
- Preview first 500 characters of extracted text

### 4.5 Document Tags

- Add custom tags to documents
- Filter and search by tag
- Bulk tag assignment

---

## 5. Chat & Q&A Interface

### 5.1 Chat Modes

**Single Document Mode**

- Conversation scoped to one document
- Deep, focused answers from a single source

**Multi-Document Mode**

- Query across multiple selected documents simultaneously
- Source attribution per answer (which document answered)
- Useful for comparing or synthesising across files

**Workspace Mode**

- Query the entire workspace (all documents)
- Best for large knowledge bases

### 5.2 Chat Features

- Real-time streaming responses (Vercel AI SDK)
- Markdown rendering in responses (tables, code blocks, lists)
- Source citation panel — highlights the exact chunk used
- Copy response to clipboard (plain text or markdown)
- Thumbs up/down feedback per answer
- Regenerate response button
- Follow-up question suggestions (AI-generated)
- Conversation title auto-generated from first question

### 5.3 Source Attribution

Every AI response includes:

- Document name and page/section reference
- Relevance confidence score (0–100%)
- Expandable source snippet showing the retrieved context
- "Jump to source" deep link (for PDF: page number)

### 5.4 Conversation Management

- Conversation history sidebar
- Rename, pin, and delete conversations
- Search conversation history by keyword
- Export conversation as Markdown or PDF

### 5.5 AI Behaviour Controls (Per Workspace)

- Response language (auto-detect or force specific language)
- Response style: Concise / Detailed / Bullet points
- Strict mode: only answer from documents, refuse speculation

---

## 6. Processing Pipeline

### 6.1 Text Extraction

- PDFs: pdfjs-dist for text layer extraction; fallback to Claude Vision for scanned PDFs
- DOCX: mammoth for structure-preserving extraction
- XLSX/CSV: SheetJS converts to readable Markdown tables
- PPTX: slide-by-slide text + speaker notes extraction
- Images: Claude claude-haiku-4-5 Vision API extracts text and describes visual content
- Code files: raw content with language metadata preserved

### 6.2 Chunking Strategy

- Recursive character text splitter
- Chunk size: 512 tokens (configurable per file type)
- Overlap: 50 tokens (preserves context across chunk boundaries)
- Metadata injected per chunk: document ID, page number, section, chunk index

### 6.3 Embedding

- Provider: Voyage AI `voyage-3` model (1024 dimensions)
- Stored in Supabase pgvector column
- IVFFlat index for fast approximate nearest-neighbour search
- Re-embedding triggered automatically if document is replaced

### 6.4 Background Processing

- Processing is async (non-blocking upload)
- Supabase Edge Function handles chunking + embedding
- Processing queue with retry logic (3 attempts on failure)
- User notified via toast when document is ready

---

## 7. Search & Retrieval

### 7.1 Hybrid Search

- **Vector search**: Cosine similarity via pgvector
- **Full-text search**: PostgreSQL `tsvector` for keyword matching
- **Hybrid score**: Weighted combination (70% vector + 30% keyword by default)
- Top-k retrieval: 6 most relevant chunks per query

### 7.2 Query Enhancement

- Query rewriting: AI expands ambiguous queries before embedding
- Hypothetical Document Embedding (HyDE): generates a hypothetical answer to improve retrieval
- Conversation history injection: last 3 turns included for contextual queries

---

## 8. Notifications

- Email: Document processing complete
- In-app toast notifications for all async events

---

## 9. Security & Privacy

- Row-Level Security (RLS) on all Supabase tables
- Documents stored in private Supabase Storage buckets (per user)
- Signed URLs for document access (expires in 1 hour)
- Documents never sent to Claude in full — only retrieved chunks
- No document training: data is never used to train AI models
- Account deletion wipes all user records and stored files

---

## 10. Internationalisation (i18n)

- UI available in: English (launch)
- AI responses in user's preferred language (system prompt controlled)
- Date, time, and number formatting per locale

---

## 11. Future Features (Post-Launch Backlog)

- Browser extension: highlight web content and save to workspace
- Notion/Google Drive sync integration
- Document summarisation (one-click)
- Automated document categorisation (AI tagging)
- Voice input for queries (Web Speech API)
- German + French UI localisation
