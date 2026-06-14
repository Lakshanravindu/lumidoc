-- Add AI behaviour settings to workspaces
alter table public.workspaces
  add column settings jsonb not null default '{
    "response_style": "detailed",
    "strict_mode": true,
    "language": "English"
  }'::jsonb;

-- Full-text search index on messages.content for conversation history search
alter table public.messages
  add column if not exists search_vector tsvector
    generated always as (to_tsvector('english', content)) stored;

create index messages_search_vector_idx
  on public.messages using gin(search_vector);

-- Function to search conversations by message content within a workspace
create or replace function public.search_conversations(
  p_user_id    uuid,
  p_workspace_id uuid,
  p_query      text
)
returns table (
  conversation_id uuid,
  conversation_title text,
  snippet text,
  updated_at timestamptz
)
language sql stable as $$
  select distinct on (c.id)
    c.id              as conversation_id,
    c.title           as conversation_title,
    ts_headline('english', m.content, plainto_tsquery('english', p_query),
      'MaxWords=15, MinWords=8, StartSel=<mark>, StopSel=</mark>'
    )                 as snippet,
    c.updated_at
  from public.conversations c
  join public.messages m on m.conversation_id = c.id
  where c.user_id = p_user_id
    and c.workspace_id = p_workspace_id
    and m.search_vector @@ plainto_tsquery('english', p_query)
  order by c.id, c.updated_at desc;
$$;
