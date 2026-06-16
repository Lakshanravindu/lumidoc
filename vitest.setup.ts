// Provide env vars before any module imports run env.ts validation
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_NAME = "LumiDoc";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.VOYAGE_API_KEY = "test-voyage-key";
