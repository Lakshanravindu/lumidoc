import { PDFParse } from "pdf-parse";

export async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText({ pageJoiner: "\n\n" });
  return result.text;
}
