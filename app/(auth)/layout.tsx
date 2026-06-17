import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain lumi-bg relative min-h-screen overflow-hidden">
      {/* ambient glow spots */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-ember/[0.05] blur-3xl" />

      {/* back to home */}
      <Link
        href="/"
        className="group absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/[0.03] px-4 py-2 text-sm text-paper-dim backdrop-blur transition-colors hover:border-paper/20 hover:text-paper sm:left-8 sm:top-8"
      >
        <svg
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to home
      </Link>

      <div className="flex min-h-screen items-center justify-center p-4">{children}</div>
    </div>
  );
}
