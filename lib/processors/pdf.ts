export async function extractFromPdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
    buffer: Buffer
  ) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  return data.text;
}
