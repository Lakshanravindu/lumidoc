"use client";

const formats = [
  "PDF",
  "Word",
  "Excel",
  "PowerPoint",
  "Images",
  "Scanned pages",
  "Markdown",
  "CSV",
  "Plain text",
  "Code files",
  "Google Docs",
  "Keynote",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {formats.map((f) => (
        <span key={f} className="flex items-center gap-10">
          <span className="font-display text-2xl font-light text-paper-dim md:text-3xl">{f}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
        </span>
      ))}
    </div>
  );
}

export default function FormatsMarquee() {
  return (
    <section className="relative border-y border-paper/[0.07] py-12">
      <div className="mask-fade-x flex overflow-hidden">
        <div className="flex animate-marquee">
          <Row />
          <Row />
        </div>
      </div>
    </section>
  );
}
