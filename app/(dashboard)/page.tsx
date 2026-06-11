import { redirect } from "next/navigation";

// Redirect root to /dashboard — the actual dashboard lives at app/(dashboard)/dashboard/page.tsx
export default function RootPage() {
  redirect("/dashboard");
}
