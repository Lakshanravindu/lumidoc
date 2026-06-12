export type DocumentStatus = "processing" | "ready" | "error";

export interface DocumentRecord {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  status: DocumentStatus;
  error_msg: string | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationRecord {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type MessageRole = "user" | "assistant";

export interface MessageRecord {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  source_chunk_ids: string[] | null;
  feedback: -1 | 1 | null;
  created_at: string;
}

export interface SourceChunk {
  chunk_id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  vector_score: number;
  fts_score: number;
  combined_score: number;
  document_name?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: SourceChunk[];
  feedback?: -1 | 1 | null;
  created_at: string;
}
