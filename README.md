# LumiDoc

AI-powered Document Q&A application. Upload any document and have intelligent conversations with its content using RAG + Anthropic Claude.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Shadcn/UI
- **Backend:** Next.js API Routes (edge runtime), Supabase (PostgreSQL + pgvector + Auth + Storage)
- **AI:** Anthropic Claude (Q&A + Vision OCR), Voyage AI `voyage-3` embeddings
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Anthropic API key
- Voyage AI API key

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/Lakshanravindu/lumidoc.git
cd lumidoc
npm install
```

2. Copy `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start dev server (Turbopack) |
| `npm run build`      | Production build             |
| `npm run lint`       | Run ESLint                   |
| `npm run type-check` | TypeScript type checking     |

## Project Structure

```
app/           # Next.js App Router pages and API routes
components/    # React components (chat, documents, workspace)
lib/           # Core logic (supabase, anthropic, voyage, processors, retrieval)
supabase/      # DB migrations and Edge Functions
types/         # TypeScript type definitions
Documentation/ # Feature spec, tech spec, roadmap
```

## Architecture

RAG pipeline: documents are chunked (512 tokens, 50 overlap), embedded via Voyage AI, and stored in Supabase pgvector. Queries use hybrid search (70% vector cosine + 30% full-text) to retrieve relevant chunks, which are passed as context to Claude for answer generation.

## License

MIT
