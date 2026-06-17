"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="grain relative overflow-hidden pb-24 pt-36 lg:pb-40 lg:pt-44">
      {/* warm ambient light, top-left, single source */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[640px] w-[640px] rounded-full bg-gold/10 blur-[160px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-ember/[0.06] blur-[150px]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div style={{ y: yText, opacity: fade }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-paper/10 bg-paper/[0.03] px-4 py-1.5 text-xs tracking-wide text-paper-dim backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_2px] shadow-gold/50" />
            Answers with sources, not guesses
          </motion.div>

          <h1 className="font-display text-[2.9rem] font-light leading-[1.04] tracking-[-0.02em] text-paper sm:text-6xl lg:text-[4.4rem]">
            <Reveal delay={0.05}>Your documents,</Reveal>
            <Reveal delay={0.15}>
              <span className="italic text-gold-soft">finally</span> answering
            </Reveal>
            <Reveal delay={0.25}>back.</Reveal>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease }}
            className="mt-7 max-w-md text-lg leading-relaxed text-paper-dim"
          >
            Upload a PDF, a spreadsheet, slides, or a scanned page, then simply ask. LumiDoc reads
            every word and replies with the exact passage it found.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/register"
              className="group relative overflow-hidden rounded-full bg-paper px-7 py-3.5 font-medium text-ink transition-transform hover:scale-[1.03]"
            >
              <span className="relative z-10">Start for free</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold-soft to-gold transition-transform duration-500 group-hover:translate-x-0" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-paper/15 px-7 py-3.5 font-medium text-paper/80 transition-colors hover:border-paper/30 hover:text-paper"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-12 flex items-center gap-5 text-sm text-paper-faint"
          >
            <span>20+ formats</span>
            <span className="h-1 w-1 rounded-full bg-paper-faint/60" />
            <span>Every answer cited</span>
            <span className="h-1 w-1 rounded-full bg-paper-faint/60" />
            <span>GDPR-ready</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: yVisual }} className="relative">
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md">
      {/* glow behind */}
      <div className="absolute inset-6 rounded-[2rem] bg-gold/10 blur-3xl" />

      {/* the document */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.4, ease }}
        className="lumi-card absolute inset-0 overflow-hidden rounded-[1.6rem] border border-paper/[0.14] bg-ink-soft/95 p-7 shadow-[0_40px_120px_-20px_var(--lumi-shadow)] backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center gap-2 text-[11px] text-paper-faint">
          <span className="h-2 w-2 rounded-full bg-ember/70" />
          annual-report-2025.pdf
        </div>

        {/* document text lines */}
        <div className="space-y-2.5">
          {["92%", "70%", "84%", "60%", "78%", "45%", "88%", "66%", "74%", "52%", "80%"].map(
            (w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: i === 6 ? 0.9 : 0.18, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.05, ease }}
                style={{ width: w }}
                className={`h-2 origin-left rounded-full ${i === 6 ? "bg-gold" : "bg-paper"}`}
              />
            )
          )}
        </div>

        {/* scanning light beam */}
        <motion.div
          initial={{ top: "12%", opacity: 0 }}
          animate={{ top: ["12%", "88%", "12%"], opacity: [0, 1, 0] }}
          transition={{ duration: 4, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-5 h-px bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_14px_2px] shadow-gold/50"
        />
      </motion.div>

      {/* floating cited-answer chip */}
      <motion.div
        initial={{ opacity: 0, y: 24, x: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.8, delay: 1.6, ease }}
        className="lumi-card absolute -bottom-6 -right-4 w-60 rounded-2xl border border-paper/[0.16] bg-ink-raised p-4 shadow-[0_24px_60px_-12px_var(--lumi-shadow)] backdrop-blur-xl sm:-right-8"
      >
        <div className="flex items-center gap-2 text-[11px] font-medium text-gold">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path
              d="M8 1.5l1.8 4 4.2.4-3.2 2.8 1 4.3L8 11.4 4.2 13l1-4.3L2 5.9l4.2-.4z"
              fill="currentColor"
            />
          </svg>
          Source · page 12
        </div>
        <p className="mt-2 text-xs leading-relaxed text-paper-dim">
          “Enterprise revenue grew <span className="text-paper">23% QoQ</span>, driven by the API
          launch.”
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-paper/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1, delay: 2, ease }}
              className="h-full rounded-full bg-gold"
            />
          </div>
          <span className="text-[10px] text-paper-faint">94%</span>
        </div>
      </motion.div>
    </div>
  );
}
