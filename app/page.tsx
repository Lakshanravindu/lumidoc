import { redirect } from "next/navigation";

// Temporary root: redirect to login until the landing page is built on feature/landing-page.
// When that branch is merged, delete this file and let app/(landing)/page.tsx own the root.
export default function RootPage() {
  redirect("/login");
}
