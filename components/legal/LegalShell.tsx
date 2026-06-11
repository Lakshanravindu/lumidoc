import type { ReactNode } from "react";

export function LegalShell({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article className="relative">
      <div className="pointer-events-none absolute -top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-gold/[0.06] blur-[150px]" />
      <header className="relative mx-auto max-w-3xl px-6 pb-12 pt-36 lg:pt-44">
        {eyebrow && (
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-paper-faint">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl font-light leading-tight tracking-tight text-paper md:text-6xl">
          {title}
        </h1>
        {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">{intro}</p>}
        {updated && <p className="mt-6 text-sm text-paper-faint">Last updated: {updated}</p>}
      </header>

      <div
        className={[
          "relative mx-auto max-w-3xl px-6 pb-28",
          "text-paper-dim leading-relaxed",
          "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-paper",
          "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-paper",
          "[&_p]:mb-4",
          "[&_a]:text-gold [&_a]:underline-offset-2 hover:[&_a]:underline",
          "[&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:pl-1",
          "[&_li]:relative [&_li]:pl-6",
          "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2.5 [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-gold/70",
          "[&_strong]:font-medium [&_strong]:text-paper",
        ].join(" ")}
      >
        {children}
      </div>
    </article>
  );
}
