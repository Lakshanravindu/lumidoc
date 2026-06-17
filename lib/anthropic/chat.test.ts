import { describe, it, expect } from "vitest";
import { buildContext, buildSystemPrompt } from "./chat";
import type { SourceChunk, WorkspaceSettings } from "@/types";

const makeChunk = (overrides: Partial<SourceChunk> = {}): SourceChunk => ({
  chunk_id: "chunk-1",
  document_id: "doc-1",
  content: "Sample content",
  chunk_index: 0,
  vector_score: 0.9,
  fts_score: 0.5,
  combined_score: 0.78,
  ...overrides,
});

describe("buildContext", () => {
  it("returns empty string for no chunks", () => {
    expect(buildContext([])).toBe("");
  });

  it("formats a single chunk correctly", () => {
    const chunk = makeChunk({ content: "The answer is 42.", combined_score: 0.85 });
    const result = buildContext([chunk]);
    expect(result).toContain("[Source 1]");
    expect(result).toContain("score: 0.850");
    expect(result).toContain("The answer is 42.");
  });

  it("separates multiple chunks with dividers", () => {
    const chunks = [
      makeChunk({ content: "First chunk", combined_score: 0.9 }),
      makeChunk({ content: "Second chunk", combined_score: 0.7 }),
    ];
    const result = buildContext(chunks);
    expect(result).toContain("[Source 1]");
    expect(result).toContain("[Source 2]");
    expect(result).toContain("---");
    expect(result).toContain("First chunk");
    expect(result).toContain("Second chunk");
  });
});

describe("buildSystemPrompt", () => {
  it("uses defaults when no settings provided", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("LumiDoc");
    expect(prompt).toContain("English");
    // Default strict_mode = true
    expect(prompt).toContain("ONLY from the provided document context");
    // Default style = detailed
    expect(prompt).toContain("thorough");
  });

  it("applies concise style", () => {
    const settings: WorkspaceSettings = {
      response_style: "concise",
      strict_mode: true,
      language: "English",
    };
    const prompt = buildSystemPrompt(settings);
    expect(prompt).toContain("brief");
  });

  it("applies bullet style", () => {
    const settings: WorkspaceSettings = {
      response_style: "bullets",
      strict_mode: true,
      language: "English",
    };
    const prompt = buildSystemPrompt(settings);
    expect(prompt).toContain("bullet points");
  });

  it("relaxes strict mode when disabled", () => {
    const settings: WorkspaceSettings = {
      response_style: "detailed",
      strict_mode: false,
      language: "English",
    };
    const prompt = buildSystemPrompt(settings);
    expect(prompt).not.toContain("ONLY from the provided document context");
    expect(prompt).toContain("general knowledge");
  });

  it("includes custom language", () => {
    const settings: WorkspaceSettings = {
      response_style: "detailed",
      strict_mode: true,
      language: "Sinhala",
    };
    const prompt = buildSystemPrompt(settings);
    expect(prompt).toContain("Sinhala");
  });
});
