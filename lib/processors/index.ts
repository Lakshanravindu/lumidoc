import { extractFromPdf } from "./pdf";
import { extractFromDocx } from "./docx";
import { extractFromXlsx } from "./xlsx";
import { extractFromPptx } from "./pptx";
import { extractFromImage } from "./image";
import { extractFromText } from "./text";

export const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "text/csv",
  "application/json",
  "text/javascript",
  "application/javascript",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractFromPdf(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return extractFromDocx(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "text/csv"
  ) {
    return extractFromXlsx(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-powerpoint"
  ) {
    return extractFromPptx(buffer);
  }
  if (mimeType.startsWith("image/")) {
    return extractFromImage(buffer, mimeType);
  }
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return extractFromText(buffer);
  }
  throw new Error(`Unsupported MIME type: ${mimeType}`);
}
