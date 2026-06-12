import { extractTextFromImage } from "@/lib/anthropic/vision";

export async function extractFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  return extractTextFromImage(buffer.toString("base64"), mimeType);
}
