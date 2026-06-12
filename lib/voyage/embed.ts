import { env } from "@/env";
import { VOYAGE_API_URL, VOYAGE_MODEL, VOYAGE_BATCH_SIZE } from "./client";

interface VoyageResponse {
  data: { embedding: number[] }[];
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += VOYAGE_BATCH_SIZE) {
    const batch = texts.slice(i, i + VOYAGE_BATCH_SIZE);
    const res = await fetchWithRetry(batch);
    embeddings.push(...res.data.map((d) => d.embedding));
  }

  return embeddings;
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

async function fetchWithRetry(batch: string[], attempt = 0): Promise<VoyageResponse> {
  try {
    const res = await fetch(VOYAGE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: batch, model: VOYAGE_MODEL }),
    });

    if (!res.ok) {
      throw new Error(`Voyage AI error ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<VoyageResponse>;
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      return fetchWithRetry(batch, attempt + 1);
    }
    throw err;
  }
}
