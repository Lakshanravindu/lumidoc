"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const points = [
  {
    title: "GDPR-ready by default",
    body: "Built for the EU. Right to access, export, and erasure are first-class. Your data, your control.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: "Row-level security",
    body: "Every record is fenced to its owner at the database layer. No query can cross that line.",
    icon: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 018 0v3" />
      </>
    ),
  },
  {
    title: "Never trains a model",
    body: "Your documents are used to answer your questions, nothing else. They are never used as training data.",
    icon: (
      <>
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <section id="privacy" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-paper-faint">
              Privacy & trust
            </p>
            <h2 className="font-display text-4xl font-light leading-tight tracking-tight text-paper md:text-5xl">
              Your documents stay <span className="italic text-gold-soft">yours</span>.
            </h2>
            <p className="mt-5 max-w-md text-paper-dim">
              LumiDoc is built for European teams who can&apos;t compromise on data protection.
              Privacy isn&apos;t a setting here. It&apos;s the architecture.
            </p>
          </motion.div>

          <div className="space-y-4">
            {points.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease }}
                className="lumi-card flex gap-5 rounded-2xl border border-paper/[0.12] bg-paper/[0.04] p-6 transition-colors hover:border-gold/25"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {p.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-paper">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-paper-dim">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
