"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function Tile({
  className = "",
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease }}
      className={`lumi-card group relative overflow-hidden rounded-2xl border border-paper/[0.12] bg-paper/[0.04] p-6 transition-colors duration-500 hover:border-gold/30 hover:bg-paper/[0.06] ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/0 blur-3xl transition-colors duration-500 group-hover:bg-gold/10" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

const formats = ["PDF", "DOCX", "XLSX", "PPTX", "PNG", "JPG", "TXT", "MD", "CSV", "Code"];

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-paper-faint">
            Capabilities
          </p>
          <h2 className="font-display text-4xl font-light leading-tight tracking-tight text-paper md:text-5xl">
            A real retrieval engine, <span className="italic text-gold-soft">not</span> a chat
            wrapper.
          </h2>
        </motion.div>

        <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-6">
          {/* Citations - tall hero tile */}
          <Tile className="md:col-span-2 md:row-span-2" delay={0}>
            <Icon>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </Icon>
            <h3 className="font-display text-2xl font-light text-paper">Every answer, cited</h3>
            <p className="mt-3 text-sm leading-relaxed text-paper-dim">
              No black box. Each response links to the exact passage, page, and a relevance score,
              so you can trust it, then verify in one click.
            </p>
            <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.06] p-4">
              <div className="text-[10px] font-medium text-gold">Source · page 12 · 94%</div>
              <p className="mt-2 text-xs italic leading-relaxed text-paper-dim">
                “Enterprise segment delivered $4.2M in net-new ARR…”
              </p>
            </div>
          </Tile>

          {/* Formats - wide tile */}
          <Tile className="md:col-span-4" delay={0.05}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <Icon>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </Icon>
                <h3 className="font-display text-2xl font-light text-paper">20+ file formats</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-paper-dim">
                  Documents, spreadsheets, slides, images, and code, even scanned pages read with
                  Vision OCR.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {formats.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-paper/10 bg-paper/[0.03] px-2.5 py-1 font-mono text-[11px] text-paper-dim"
                >
                  {f}
                </span>
              ))}
            </div>
          </Tile>

          {/* Hybrid search */}
          <Tile className="md:col-span-2" delay={0.1}>
            <Icon>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </Icon>
            <h3 className="font-display text-xl font-light text-paper">Hybrid search</h3>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim">
              Semantic vectors + keyword matching, fused, catching what either alone would miss.
            </p>
          </Tile>

          {/* Streaming */}
          <Tile className="md:col-span-2" delay={0.15}>
            <Icon>
              <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
            </Icon>
            <h3 className="font-display text-xl font-light text-paper">Streaming answers</h3>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim">
              Replies arrive word by word. No spinners, no waiting for a wall of text.
            </p>
          </Tile>

          {/* Workspaces */}
          <Tile className="md:col-span-3" delay={0.1}>
            <Icon>
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </Icon>
            <h3 className="font-display text-xl font-light text-paper">Workspaces</h3>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim">
              Group related documents and conversations. Query a single file or an entire knowledge
              base at once.
            </p>
          </Tile>

          {/* Privacy teaser */}
          <Tile className="md:col-span-3" delay={0.15}>
            <Icon>
              <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
            </Icon>
            <h3 className="font-display text-xl font-light text-paper">Private by design</h3>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim">
              Row-level security, private storage, signed URLs. Your documents never train a model
              and stay yours.
            </p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
