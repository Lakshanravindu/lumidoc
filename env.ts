import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  VOYAGE_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

function validateEnv() {
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

    return { ...clientEnv.data, ...serverEnv.data };
  }

  return clientEnv.data;
}

export const env = validateEnv();
