// deno-lint-ignore-file
// Deno Edge Function — npm: imports are resolved at runtime by Deno, not bundled by tsc
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  let documentId: string | undefined;

  try {
    ({ documentId } = await req.json());
    if (!documentId) throw new Error("documentId is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch document record
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) throw new Error(`Document not found: ${documentId}`);

    // Download file from storage
    const { data: fileBlob, error: storageErr } = await supabase.storage
      .from("documents")
      .download(doc.storage_path);
    if (storageErr || !fileBlob) throw new Error(`Storage download failed: ${storageErr?.message}`);

    const arrayBuf = await fileBlob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuf);

    // Extract text based on MIME type
    const text = await extractText(uint8, doc.mime_type);
    if (!text.trim()) throw new Error("No text could be extracted from this document");

    // Chunk text
    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) throw new Error("Document produced no chunks");

    // Generate embeddings via Voyage AI (batched with retry)
    const allEmbeddings = await embedTexts(chunks);

    // Store chunks in DB
    const chunkRows = chunks.map((content, idx) => ({
      document_id: documentId,
      user_id: doc.user_id,
      content,
      chunk_index: idx,
      embedding: JSON.stringify(allEmbeddings[idx]),
    }));

    const { error: insertErr } = await supabase.from("document_chunks").insert(chunkRows);
    if (insertErr) throw insertErr;

    // Mark document as ready
    await supabase
      .from("documents")
      .update({ status: "ready", chunk_count: chunks.length })
      .eq("id", documentId);

    return new Response(JSON.stringify({ success: true, chunks: chunks.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-document error:", err);
    if (documentId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase
          .from("documents")
          .update({
            status: "error",
            error_msg: err instanceof Error ? err.message : "Processing failed",
          })
          .eq("id", documentId);
      } catch {
        /* best-effort */
      }
    }
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

// ─── Text extraction ────────────────────────────────────────────────────────

async function extractText(uint8: Uint8Array, mimeType: string): Promise<string> {
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return new TextDecoder().decode(uint8);
  }

  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("npm:pdf-parse@2");
    const { Buffer } = await import("npm:buffer@6");
    const parser = new PDFParse({ data: Buffer.from(uint8) });
    const result = await parser.getText({ pageJoiner: "\n\n" });
    return result.text as string;
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { default: mammoth } = await import("npm:mammoth@1");
    const { Buffer } = await import("npm:buffer@6");
    const result = await mammoth.extractRawText({ buffer: Buffer.from(uint8) });
    return result.value as string;
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "text/csv"
  ) {
    const XLSX = await import("npm:xlsx@0.18");
    const wb = XLSX.read(uint8, { type: "array" });
    return wb.SheetNames.map(
      (n: string) => `## ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`
    ).join("\n\n");
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    const { default: JSZip } = await import("npm:jszip@3");
    const zip = await JSZip.loadAsync(uint8.buffer);
    const slides = Object.keys(zip.files)
      .filter((n: string) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort();
    const texts = await Promise.all(
      slides.map(async (s: string) => {
        const xml = await zip.files[s].async("string");
        return xml
          .replace(/<a:t>/g, " ")
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
      })
    );
    return texts.filter(Boolean).join("\n\n");
  }

  if (mimeType.startsWith("image/")) {
    const b64 = btoa(String.fromCharCode(...uint8));
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: b64 } },
              {
                type: "text",
                text: "Extract all text from this image. Return only the extracted text.",
              },
            ],
          },
        ],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  throw new Error(`Unsupported MIME type: ${mimeType}`);
}

// ─── Text chunker ────────────────────────────────────────────────────────────

const CHUNK_SIZE = 2048;
const OVERLAP = 200;

function splitIntoChunks(text: string): string[] {
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
      if (para.length > CHUNK_SIZE) {
        const sentences = para.match(/[^.!?]+[.!?]+\s*/g) ?? [para];
        let buf = "";
        for (const s of sentences) {
          if ((buf + s).length <= CHUNK_SIZE) {
            buf += s;
          } else {
            if (buf) rawChunks.push(buf.trim());
            buf = s.length <= CHUNK_SIZE ? s : s.slice(0, CHUNK_SIZE);
          }
        }
        current = buf;
      } else {
        current = para;
      }
    }
  }
  if (current.trim()) rawChunks.push(current.trim());

  return rawChunks
    .map((chunk, i) => {
      if (i === 0) return chunk;
      return (rawChunks[i - 1].slice(-OVERLAP) + " " + chunk).trim();
    })
    .filter((c) => c.length >= 20);
}

// ─── Voyage AI embeddings ─────────────────────────────────────────────────────

async function embedTexts(texts: string[]): Promise<number[][]> {
  const BATCH = 128;
  const all: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    all.push(...(await embedBatch(batch)));
  }
  return all;
}

async function embedBatch(batch: string[], attempt = 0): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("VOYAGE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: batch, model: "voyage-3" }),
  });

  if (!res.ok) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      return embedBatch(batch, attempt + 1);
    }
    throw new Error(`Voyage AI error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}
