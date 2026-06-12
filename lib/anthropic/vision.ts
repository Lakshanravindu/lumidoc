import { anthropic } from "./client";

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function extractTextFromImage(imageBase64: string, mimeType: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as ImageMediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Extract all text from this image. Return only the extracted text, preserving formatting where possible. If no text is present, return an empty string.",
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}
