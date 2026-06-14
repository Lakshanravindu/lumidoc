import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  VOYAGE_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

type ClientEnv = z.infer<typeof clientSchema>;
type ServerEnv = z.infer<typeof serverSchema>;
type AppEnv = ClientEnv & ServerEnv;

function validateEnv(): AppEnv {
  const isServer = typeof window === "undefined";

  const clientEnv = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!clientEnv.success) {
    console.error(
      "❌ Invalid public environment variables:",
      clientEnv.error.flatten().fieldErrors
    );
    throw new Error("Invalid public environment variables");
  }

  if (isServer) {
    const serverEnv = serverSchema.safeParse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      VOYAGE_API_KEY: process.env.VOYAGE_API_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    });

    if (!serverEnv.success) {
      console.error(
        "❌ Invalid server environment variables:",
        serverEnv.error.flatten().fieldErrors
      );
      throw new Error("Invalid server environment variables");
    }

    return { ...clientEnv.data, ...serverEnv.data } as AppEnv;
  }

  // On the client, server keys are not available at runtime — cast is safe
  return clientEnv.data as AppEnv;
}

export const env = validateEnv();
