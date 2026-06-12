import { createServiceClient } from "@/lib/supabase/service";
import { embedText } from "@/lib/voyage/embed";
import type { SourceChunk } from "@/types";

export async function hybridSearch(
  queryText: string,
  queryEmbedding: number[],
  documentIds: string[],
  matchCount = 6
): Promise<SourceChunk[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("hybrid_search", {
    query_embedding: JSON.stringify(queryEmbedding),
    query_text: queryText,
    doc_ids: documentIds,
    match_count: matchCount,
  });

  if (error) throw new Error(`hybrid_search failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    chunk_id: row.chunk_id,
    document_id: row.document_id,
    content: row.content,
    chunk_index: row.chunk_index,
    vector_score: row.vector_score,
    fts_score: row.fts_score,
    combined_score: row.combined_score,
  }));
}

export async function retrieveChunks(
  query: string,
  documentIds: string[],
  matchCount = 6
): Promise<SourceChunk[]> {
  const embedding = await embedText(query);
  return hybridSearch(query, embedding, documentIds, matchCount);
}
