import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import { env } from "@/env";
import type { SourceChunk, WorkspaceSettings } from "@/types";

const anthropicProvider = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
const CHAT_MODEL = "claude-sonnet-4-6";
const SUGGESTIONS_MODEL = "claude-haiku-4-5-20251001";

function buildSystemPrompt(settings?: WorkspaceSettings): string {
  const strict = settings?.strict_mode ?? true;
  const style = settings?.response_style ?? "detailed";
  const language = settings?.language ?? "English";

  const styleGuide =
    style === "concise"
      ? "Be brief and to the point. Avoid unnecessary elaboration."
      : style === "bullets"
        ? "Structure your answer as bullet points or numbered lists wherever possible."
        : "Be thorough and well-structured. Use headings and paragraphs as appropriate.";

  const strictGuide = strict
    ? "Answer ONLY from the provided document context. If the answer is not in the documents, say clearly that you cannot find it in the provided documents. Do not use outside knowledge."
    : "Primarily answer from the provided document context. You may supplement with general knowledge when the documents don't cover the topic, but clearly indicate when you do so.";

  return `You are LumiDoc, an AI assistant that answers questions based on the documents provided.

Response language: ${language}
${styleGuide}
${strictGuide}
- Cite specific parts of the documents when relevant.
- Use markdown formatting for clarity.
- Never fabricate information.`;
}

export function streamChatResponse(
  query: string,
  context: string,
  history: { role: "user" | "assistant"; content: string }[],
  onFinish?: (text: string) => Promise<void>,
  settings?: WorkspaceSettings
) {
  return streamText({
    model: anthropicProvider(CHAT_MODEL),
    system: buildSystemPrompt(settings),
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
