-- Enable pgvector extension
create extension if not exists vector;

-- Document processing status enum
create type document_status as enum ('processing', 'ready', 'error');

-- documents: tracks uploaded files per workspace
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null,
  storage_path text not null,
  mime_type    text not null,
  size_bytes   bigint not null,
  status       document_status not null default 'processing',
  error_msg    text,
  chunk_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index documents_workspace_id_idx on public.documents (workspace_id);
create index documents_user_id_idx on public.documents (user_id);
create index documents_status_idx on public.documents (status);

alter table public.documents enable row level security;

create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

create trigger set_documents_updated_at
  before update on public.documents
  for each row execute procedure public.set_updated_at();

-- document_chunks: text chunks with vector embeddings for RAG
create table public.document_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  content     text not null,
  chunk_index integer not null,
  page_number integer,
  embedding   vector(1024),
  created_at  timestamptz not null default now()
);

create index document_chunks_document_id_idx on public.document_chunks (document_id);
create index document_chunks_user_id_idx on public.document_chunks (user_id);

-- IVFFlat index for approximate cosine similarity search
create index document_chunks_embedding_idx
  on public.document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.document_chunks enable row level security;

create policy "Users can view own chunks"
  on public.document_chunks for select
  using (auth.uid() = user_id);

create policy "Users can insert own chunks"
  on public.document_chunks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own chunks"
  on public.document_chunks for delete
  using (auth.uid() = user_id);

-- Storage bucket for raw document files (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  20971520,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
);

create policy "Users can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own document files"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own document files"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
