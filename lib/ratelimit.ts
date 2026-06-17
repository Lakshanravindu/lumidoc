import { env } from "@/env";

type RateLimitAction = "chat" | "upload" | "conversations";

const LIMITS: Record<
  RateLimitAction,
  { requests: number; window: import("@upstash/ratelimit").Duration }
> = {
  chat: { requests: 20, window: "1 m" },
  upload: { requests: 10, window: "1 m" },
  conversations: { requests: 30, window: "1 m" },
};

// Lazily initialised so the module can be imported without crashing when
// Upstash env vars are absent (e.g. in tests or local dev without Redis).
let limiters: Record<RateLimitAction, import("@upstash/ratelimit").Ratelimit> | null = null;

async function getLimiters() {
  if (limiters) return limiters;
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  limiters = {
    chat: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.chat.requests, LIMITS.chat.window),
      prefix: "lumidoc:rl:chat",
    }),
    upload: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.upload.requests, LIMITS.upload.window),
      prefix: "lumidoc:rl:upload",
    }),
    conversations: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.conversations.requests, LIMITS.conversations.window),
      prefix: "lumidoc:rl:conversations",
    }),
  };

  return limiters;
}

/**
 * Check rate limit for a given action + user ID.
 * Returns null when Upstash is not configured (graceful degradation).
 * Returns a 429 Response when the limit is exceeded.
 */
export async function checkRateLimit(
  userId: string,
  action: RateLimitAction
): Promise<Response | null> {
  const l = await getLimiters();
  if (!l) return null;

  const { success, limit, remaining, reset } = await l[action].limit(userId);

  if (!success) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  return null;
}
