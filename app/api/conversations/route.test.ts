import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { NextRequest } from "next/server";

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockSingle = vi.fn();

const mockEq: ReturnType<typeof vi.fn> = vi.fn(() => ({
  eq: mockEq,
  single: mockSingle,
  order: vi.fn(() => ({ eq: mockEq })),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = vi.fn<any>(() => ({
  select: vi.fn(() => ({ eq: mockEq })),
  insert: vi.fn(() => ({ select: () => ({ single: mockSingle }) })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

// ── Helper ─────────────────────────────────────────────────────────────────────
function makePost(body: unknown) {
  const req = new NextRequest(new URL("http://localhost/api/conversations"), { method: "POST" });
  Object.defineProperty(req, "json", {
    value: vi.fn().mockResolvedValue(body),
    writable: true,
    configurable: true,
  });
  return req;
}

function makeGet(searchParams?: Record<string, string>) {
  const url = new URL("http://localhost/api/conversations");
  if (searchParams) Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url, { method: "GET" });
}

beforeEach(() => vi.clearAllMocks());

// ── POST ───────────────────────────────────────────────────────────────────────
describe("POST /api/conversations", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("no session") });
    const res = await POST(makePost({}));
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing document_ids", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const res = await POST(makePost({ workspace_id: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty document_ids array", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const res = await POST(
      makePost({ workspace_id: "550e8400-e29b-41d4-a716-446655440001", document_ids: [] })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when workspace not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const res = await POST(
      makePost({
        workspace_id: "550e8400-e29b-41d4-a716-446655440001",
        document_ids: ["550e8400-e29b-41d4-a716-446655440002"],
      })
    );
    expect(res.status).toBe(404);
  });

  it("creates conversation and returns 201", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockSingle
      .mockResolvedValueOnce({ data: { id: "ws-1" }, error: null })
      .mockResolvedValueOnce({ data: { id: "conv-1", title: "New conversation" }, error: null });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockImplementation((table: any) => ({
      select: vi.fn(() => ({ eq: mockEq })),
      insert:
        table === "conversation_documents"
          ? vi.fn().mockResolvedValue({ error: null })
          : vi.fn(() => ({ select: () => ({ single: mockSingle }) })),
    }));

    const res = await POST(
      makePost({
        workspace_id: "550e8400-e29b-41d4-a716-446655440001",
        document_ids: ["550e8400-e29b-41d4-a716-446655440002"],
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.conversation.id).toBe("conv-1");
  });
});

// ── GET ────────────────────────────────────────────────────────────────────────
describe("GET /api/conversations", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("no session") });
    const res = await GET(makeGet({ workspace_id: "ws-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 without workspace_id param", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const res = await GET(makeGet());
    expect(res.status).toBe(400);
  });
});
