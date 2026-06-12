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
