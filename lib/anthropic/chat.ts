import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import { env } from "@/env";
import type { SourceChunk } from "@/types";

const anthropicProvider = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
const CHAT_MODEL = "claude-sonnet-4-6";
const SUGGESTIONS_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are LumiDoc, an AI assistant that answers questions based on the documents provided.

Guidelines:
- Answer only from the provided document context. If the answer isn't in the documents, say so clearly.
- Cite specific parts of the documents when relevant.
- Be concise but thorough.
- Use markdown formatting for clarity (headings, bullet points, code blocks).
- Never fabricate information not present in the context.`;

export function streamChatResponse(
  query: string,
  context: string,
  history: { role: "user" | "assistant"; content: string }[],
  onFinish?: (text: string) => Promise<void>
) {
  return streamText({
    model: anthropicProvider(CHAT_MODEL),
    system: SYSTEM_PROMPT,
    messages: [
      ...history,
      {
        role: "user",
        content: `<context>\n${context}\n</context>\n\n${query}`,
      },
    ],
    maxOutputTokens: 2048,
    onFinish: onFinish
      ? async (event) => {
          await onFinish(event.text);
        }
      : undefined,
  });
}

export function buildContext(chunks: SourceChunk[]): string {
  return chunks
    .map((c, i) => `[Source ${i + 1}] (score: ${c.combined_score.toFixed(3)})\n${c.content}`)
    .join("\n\n---\n\n");
}

export async function generateFollowUpSuggestions(
  query: string,
  answer: string
): Promise<string[]> {
  const { text } = await generateText({
    model: anthropicProvider(SUGGESTIONS_MODEL),
    messages: [
      {
        role: "user",
        content: `Based on this Q&A, generate exactly 3 concise follow-up questions a user might ask next. Return only the questions, one per line, no numbering or bullets.\n\nQ: ${query}\nA: ${answer}`,
      },
    ],
    maxOutputTokens: 150,
  });

  return text
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 3);
}
