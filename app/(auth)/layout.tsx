export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain lumi-bg relative min-h-screen overflow-hidden">
      {/* ambient glow spots */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-ember/[0.05] blur-3xl" />

      <div className="flex min-h-screen items-center justify-center p-4">{children}</div>
    </div>
  );
}
