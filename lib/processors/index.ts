import { extractFromPdf } from "./pdf";
import { extractFromDocx } from "./docx";
import { extractFromXlsx } from "./xlsx";
import { extractFromPptx } from "./pptx";
import { extractFromImage } from "./image";
import { extractFromText } from "./text";

export { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from "./constants";

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
