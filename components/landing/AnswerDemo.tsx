"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function AnswerDemo() {
  return (
    <section className="relative py-28 lg:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-paper-faint">
            See it in action
          </p>
          <h2 className="font-display text-4xl font-light leading-tight tracking-tight text-paper md:text-5xl">
            The answer points back at the <span className="italic text-gold-soft">page</span>.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="lumi-card grid gap-4 overflow-hidden rounded-3xl border border-paper/[0.12] bg-ink-soft/70 p-4 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl lg:grid-cols-[0.85fr_1.15fr]"
        >
          {/* left: the source document */}
          <div className="relative rounded-2xl border border-paper/10 bg-ink p-6">
            <div className="mb-5 flex items-center gap-2 text-[11px] text-paper-faint">
              <span className="h-2 w-2 rounded-full bg-ember/70" />
              Q3-financial-report.pdf · page 12
            </div>
            <div className="space-y-2.5">
              {[1, 0.8, 0.9].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w * 100}%` }}
                  className="h-2 rounded-full bg-paper/12"
                />
              ))}
              {/* highlighted source line */}
              <motion.div
                initial={{ backgroundColor: "rgba(224,168,63,0)" }}
                whileInView={{ backgroundColor: "rgba(224,168,63,0.14)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="rounded-md border-l-2 border-gold px-2 py-2"
              >
                <p className="text-[11px] italic leading-relaxed text-paper-dim">
                  “Enterprise segment expansion delivered $4.2M in net-new ARR, a 23% increase from
                  Q2…”
                </p>
              </motion.div>
              {[0.7, 0.85, 0.6, 0.8].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w * 100}%` }}
                  className="h-2 rounded-full bg-paper/12"
                />
              ))}
            </div>
          </div>

          {/* right: the conversation */}
          <div className="flex flex-col justify-center gap-5 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="flex justify-end"
            >
              <div className="max-w-md rounded-2xl rounded-br-sm bg-paper px-5 py-3 text-sm font-medium text-ink">
                What was the main driver of revenue growth this quarter?
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7, ease }}
              className="flex justify-start"
            >
              <div className="max-w-lg rounded-2xl rounded-bl-sm border border-paper/10 bg-paper/[0.04] px-5 py-4 text-sm leading-relaxed text-paper/90">
                Revenue grew{" "}
                <strong className="font-semibold text-gold-soft">23% quarter-over-quarter</strong>,
                driven primarily by enterprise subscriptions, 68% of all net-new revenue. The report
                ties this to July&apos;s API platform launch.
                <div className="mt-4 rounded-xl border border-gold/25 bg-gold/[0.08] px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-gold">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M8 1.5l1.8 4 4.2.4-3.2 2.8 1 4.3L8 11.4 4.2 13l1-4.3L2 5.9l4.2-.4z" />
                    </svg>
                    Source · page 12 · Relevance 94%
                  </div>
                  <p className="mt-1.5 text-xs italic text-paper-dim">
                    “Enterprise segment expansion delivered $4.2M in net-new ARR…”
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
