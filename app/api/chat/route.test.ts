import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// ── Supabase mocks ────────────────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockSingle = vi.fn();

const mockEq: ReturnType<typeof vi.fn> = vi.fn(() => ({
  eq: mockEq,
  single: mockSingle,
  order: vi.fn(() => ({ limit: vi.fn().mockResolvedValue({ data: [], error: null }) })),
  in: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: mockEq })),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    })
  ),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({ eq: vi.fn() })),
    })),
  })),
}));

vi.mock("@/lib/retrieval/hyde", () => ({
  hydeRetrieve: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/anthropic/chat", () => ({
  streamChatResponse: vi.fn().mockReturnValue({
    toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok", { status: 200 })),
  }),
  buildContext: vi.fn().mockReturnValue(""),
  buildSystemPrompt: vi.fn().mockReturnValue(""),
  generateFollowUpSuggestions: vi.fn().mockResolvedValue([]),
}));

// ── Helper ────────────────────────────────────────────────────────────────────
function makePost(body: unknown) {
  const req = new NextRequest(new URL("http://localhost/api/chat"), { method: "POST" });
  Object.defineProperty(req, "json", {
    value: vi.fn().mockResolvedValue(body),
    writable: true,
    configurable: true,
  });
  return req;
}

beforeEach(() => vi.clearAllMocks());

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/chat", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("no session") });
    const res = await POST(makePost({ conversation_id: "any", query: "hello" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty query", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const res = await POST(
      makePost({ conversation_id: "550e8400-e29b-41d4-a716-446655440001", query: "" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing conversation_id", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const res = await POST(makePost({ query: "What is this?" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when conversation not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const res = await POST(
      makePost({
        conversation_id: "550e8400-e29b-41d4-a716-446655440001",
        query: "What is this?",
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when conversation has no linked documents", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockSingle.mockResolvedValue({
      data: {
        id: "conv-1",
        title: "Test",
        conversation_documents: [],
        workspaces: { settings: {} },
      },
      error: null,
    });

    const res = await POST(
      makePost({
        conversation_id: "550e8400-e29b-41d4-a716-446655440001",
        query: "What is this?",
      })
    );
    expect(res.status).toBe(400);
  });
});
