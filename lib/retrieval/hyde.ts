import { anthropic } from "@/lib/anthropic/client";
import { embedText } from "@/lib/voyage/embed";
import { hybridSearch } from "./hybrid-search";
import type { SourceChunk } from "@/types";

// Generates a hypothetical answer to the query, then embeds that answer for
// retrieval instead of the raw query. Improves recall on complex questions.
export async function hydeRetrieve(
  query: string,
  documentIds: string[],
  matchCount = 6
): Promise<SourceChunk[]> {
  const hypotheticalAnswer = await generateHypotheticalAnswer(query);
  const embedding = await embedText(hypotheticalAnswer);
  return hybridSearch(query, embedding, documentIds, matchCount);
}

async function generateHypotheticalAnswer(query: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Write a short, factual passage that directly answers this question. Do not ask for clarification. Just write the answer as if it were found in a document.\n\nQuestion: ${query}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : query;
}
