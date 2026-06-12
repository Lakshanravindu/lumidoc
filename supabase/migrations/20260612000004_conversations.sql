-- conversations: chat sessions scoped to a workspace
create table public.conversations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null default 'New conversation',
  pinned       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users manage own conversations"
  on public.conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index conversations_workspace_id_idx on public.conversations (workspace_id);
create index conversations_user_id_created_at_idx on public.conversations (user_id, created_at desc);

-- messages: individual chat turns within a conversation
create type message_role as enum ('user', 'assistant');

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            message_role not null,
  content         text not null,
  -- chunk IDs that were retrieved for this assistant message (null for user messages)
  source_chunk_ids uuid[],
  -- thumbs up/down feedback on assistant messages
  feedback        smallint check (feedback in (-1, 1)),
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users manage own messages"
  on public.messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index messages_conversation_id_idx on public.messages (conversation_id, created_at asc);

-- conversation_documents: which documents are scoped to a conversation
create table public.conversation_documents (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  document_id     uuid not null references public.documents (id) on delete cascade,
  primary key (conversation_id, document_id)
);

alter table public.conversation_documents enable row level security;

create policy "Users manage own conversation_documents"
  on public.conversation_documents for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- auto-update conversations.updated_at on new messages
create or replace function public.touch_conversation_on_message()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

-- hybrid search: 70% vector cosine similarity + 30% full-text search
create or replace function public.hybrid_search(
  query_embedding  vector(1024),
  query_text       text,
  doc_ids          uuid[],
  match_count      int default 6
)
returns table (
  chunk_id         uuid,
  document_id      uuid,
  content          text,
  chunk_index      int,
  vector_score     float,
  fts_score        float,
  combined_score   float
)
language sql stable as $$
  with vector_results as (
    select
      dc.id                                                       as chunk_id,
      dc.document_id,
      dc.content,
      dc.chunk_index,
      1 - (dc.embedding <=> query_embedding)                     as vector_score
    from public.document_chunks dc
    where dc.document_id = any(doc_ids)
    order by dc.embedding <=> query_embedding
    limit match_count * 2
  ),
  fts_results as (
    select
      dc.id                                                       as chunk_id,
      ts_rank_cd(
        to_tsvector('english', dc.content),
        plainto_tsquery('english', query_text)
      )                                                           as fts_score
    from public.document_chunks dc
    where dc.document_id = any(doc_ids)
      and to_tsvector('english', dc.content) @@ plainto_tsquery('english', query_text)
  )
  select
    vr.chunk_id,
    vr.document_id,
    vr.content,
    vr.chunk_index,
    vr.vector_score,
    coalesce(fr.fts_score, 0)                                    as fts_score,
    (0.7 * vr.vector_score + 0.3 * coalesce(fr.fts_score, 0))   as combined_score
  from vector_results vr
  left join fts_results fr on fr.chunk_id = vr.chunk_id
  order by combined_score desc
  limit match_count;
$$;
