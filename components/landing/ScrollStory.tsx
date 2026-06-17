"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const stages = [
  {
    n: "01",
    title: "Upload anything",
    body: "Drop in a PDF, Word doc, spreadsheet, slide deck, image, or scanned page. LumiDoc reads them all.",
  },
  {
    n: "02",
    title: "Split into context",
    body: "Each document is broken into overlapping passages: small enough to be precise, large enough to keep meaning.",
  },
  {
    n: "03",
    title: "Understand the meaning",
    body: "Every passage becomes a vector: a mathematical fingerprint of what it means, not just the words it uses.",
  },
  {
    n: "04",
    title: "Answer, with the receipt",
    body: "Your question retrieves the closest passages, and the answer arrives with the exact source attached.",
  },
];

export default function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(stages.length - 1, Math.max(0, Math.floor(v * stages.length)));
    setActive(i);
  });

  return (
    <section id="how-it-works" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* moving ambient light follows the active stage */}
        <motion.div
          aria-hidden
          animate={{ x: active % 2 === 0 ? -120 : 120 }}
          transition={{ duration: 1.2, ease }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[150px]"
        />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          {/* left: steps */}
          <div>
            <p className="mb-10 font-mono text-xs uppercase tracking-[0.3em] text-paper-faint">
              How it works
            </p>
            <div className="space-y-7">
              {stages.map((s, i) => (
                <motion.div
                  key={s.n}
                  animate={{ opacity: active === i ? 1 : 0.3 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-5"
                >
                  <span
                    className={`font-mono text-sm transition-colors duration-300 ${
                      active === i ? "text-gold" : "text-paper-faint"
                    }`}
                  >
                    {s.n}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-light text-paper md:text-3xl">
                      {s.title}
                    </h3>
                    <motion.p
                      animate={{ opacity: active === i ? 1 : 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="mt-2.5 max-w-sm text-sm leading-relaxed text-paper-dim"
                    >
                      {s.body}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* progress rail */}
            <div className="mt-12 h-px w-full max-w-sm overflow-hidden bg-paper/10">
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="h-full origin-left bg-gradient-to-r from-gold to-gold-soft"
              />
            </div>
          </div>

          {/* right: morphing stage */}
          <div className="relative mx-auto h-[360px] w-full max-w-md">
            <Stage show={active === 0}>
              <StageUpload />
            </Stage>
            <Stage show={active === 1}>
              <StageChunk />
            </Stage>
            <Stage show={active === 2}>
              <StageEmbed />
            </Stage>
            <Stage show={active === 3}>
              <StageAnswer />
            </Stage>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stage({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.96 }}
      transition={{ duration: 0.5, ease }}
      style={{ pointerEvents: show ? "auto" : "none" }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

function StageUpload() {
  return (
    <div className="w-64 rounded-2xl border border-paper/10 bg-ink-soft/90 p-6 shadow-2xl">
      <div className="mb-4 flex items-center gap-2 text-[11px] text-paper-faint">
        <span className="h-2 w-2 rounded-full bg-ember/70" />
        annual-report.pdf
      </div>
      <div className="space-y-2">
        {[1, 0.7, 0.85, 0.5, 0.75, 0.6].map((w, i) => (
          <div key={i} style={{ width: `${w * 100}%` }} className="h-2 rounded-full bg-paper/15" />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-dashed border-gold/30 bg-gold/5 py-2.5 text-xs text-gold">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor">
          <path d="M8 11V3M8 3L5 6M8 3l3 3M3 12h10" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Uploaded
      </div>
    </div>
  );
}

function StageChunk() {
  return (
    <div className="grid w-72 grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-paper/10 bg-ink-soft/90 p-3.5 shadow-lg">
          <div className="mb-1.5 font-mono text-[9px] text-gold">chunk {i + 1}</div>
          <div className="space-y-1.5">
            {[1, 0.6, 0.8].map((w, j) => (
              <div
                key={j}
                style={{ width: `${w * 100}%` }}
                className="h-1.5 rounded-full bg-paper/15"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StageEmbed() {
  return (
    <div className="grid w-72 grid-cols-6 gap-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="aspect-square rounded-full bg-gold"
          style={{ opacity: 0.2 + ((i * 37) % 80) / 100 }}
        />
      ))}
    </div>
  );
}

function StageAnswer() {
  return (
    <div className="w-72 space-y-3">
      <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-paper px-4 py-2.5 text-xs font-medium text-ink">
        What drove revenue growth?
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-paper/10 bg-ink-soft/90 px-4 py-3 text-xs leading-relaxed text-paper-dim shadow-lg">
        Revenue grew <span className="text-paper">23% QoQ</span>, driven mainly by enterprise API
        subscriptions.
        <div className="mt-2.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-2">
          <span className="text-[10px] font-medium text-gold">Source · page 12 · 94%</span>
        </div>
      </div>
    </div>
  );
}
