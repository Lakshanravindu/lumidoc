const CHUNK_SIZE = 2048; // ~512 tokens at 4 chars/token
const OVERLAP = 200; // ~50 tokens

export function splitIntoChunks(text: string): string[] {
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!cleaned) return [];

  const paragraphs = cleaned.split("\n\n");
  const rawChunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? current + "\n\n" + para : para;
    if (candidate.length <= CHUNK_SIZE) {
      current = candidate;
    } else {
      if (current) rawChunks.push(current.trim());
      current = para.length <= CHUNK_SIZE ? para : splitLargeParagraph(para, rawChunks);
    }
  }
  if (current.trim()) rawChunks.push(current.trim());

  // Add overlap between consecutive chunks
  return rawChunks
    .map((chunk, i) => {
      if (i === 0) return chunk;
      const tail = rawChunks[i - 1].slice(-OVERLAP);
      return (tail + " " + chunk).trim();
    })
    .filter((c) => c.length >= 20);
}

function splitLargeParagraph(para: string, sink: string[]): string {
  const sentences = para.match(/[^.!?]+[.!?]+\s*/g) ?? [para];
  let buf = "";
  for (const sent of sentences) {
    if ((buf + sent).length <= CHUNK_SIZE) {
      buf += sent;
    } else {
      if (buf) sink.push(buf.trim());
      buf = sent.length <= CHUNK_SIZE ? sent : sent.slice(0, CHUNK_SIZE);
    }
  }
  return buf;
}
