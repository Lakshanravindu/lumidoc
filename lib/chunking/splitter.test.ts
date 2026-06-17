import { describe, it, expect } from "vitest";
import { splitIntoChunks } from "./splitter";

describe("splitIntoChunks", () => {
  it("returns empty array for empty string", () => {
    expect(splitIntoChunks("")).toEqual([]);
    expect(splitIntoChunks("   ")).toEqual([]);
  });

  it("returns single chunk for short text", () => {
    const text = "Hello world. This is a short document.";
    const chunks = splitIntoChunks(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("filters out chunks shorter than 20 characters", () => {
    const text = "Hi.\n\n" + "A".repeat(2100) + "\n\nBye.";
    const chunks = splitIntoChunks(text);
    chunks.forEach((c) => expect(c.length).toBeGreaterThanOrEqual(20));
  });

  it("normalises multiple blank lines to double newline", () => {
    const text = "Para one.\n\n\n\n\nPara two.";
    const chunks = splitIntoChunks(text);
    expect(chunks[0]).not.toContain("\n\n\n");
  });

  it("adds overlap from previous chunk", () => {
    // Build text that forces at least 2 chunks (>2048 chars each paragraph)
    const para1 = "A".repeat(2100);
    const para2 = "B".repeat(2100);
    const chunks = splitIntoChunks(`${para1}\n\n${para2}`);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // Second chunk should start with tail of first (overlap)
    const secondChunk = chunks[1];
    expect(secondChunk.startsWith("A")).toBe(true);
  });

  it("splits oversized paragraph at sentence boundaries", () => {
    const sentences = Array.from({ length: 30 }, (_, i) => `Sentence number ${i + 1} ends here.`);
    const text = sentences.join(" ");
    const chunks = splitIntoChunks(text);
    // All sentences present across chunks
    const combined = chunks.join(" ");
    expect(combined).toContain("Sentence number 1");
    expect(combined).toContain("Sentence number 30");
  });

  it("handles windows line endings", () => {
    const text = "Line one.\r\nLine two.\r\nLine three.";
    const chunks = splitIntoChunks(text);
    expect(chunks.length).toBeGreaterThan(0);
    chunks.forEach((c) => expect(c).not.toContain("\r"));
  });
});
