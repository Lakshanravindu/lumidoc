"use client";

import { motion } from "framer-motion";

export default function ChatPreview() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Answers you can{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              actually trust
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a1a]/80 shadow-[0_24px_80px_rgba(139,92,246,0.15)] backdrop-blur-xl"
        >
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="ml-3 text-xs text-white/40">Q3-financial-report.pdf · Ready</span>
          </div>

          <div className="space-y-5 p-6 md:p-8">
            {/* user message */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-end"
            >
              <div className="max-w-md rounded-2xl rounded-br-sm bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm text-white">
                What was the main driver of revenue growth this quarter?
              </div>
            </motion.div>

            {/* assistant message */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-start"
            >
              <div className="max-w-lg rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-5 py-4 text-sm leading-relaxed text-white/85">
                Revenue grew <strong className="text-cyan-300">23% quarter-over-quarter</strong>,
                primarily driven by enterprise subscriptions, which accounted for 68% of new
                revenue. The report attributes this to the launch of the API platform in July.
                <div className="mt-4 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3.5 py-2.5 text-xs">
                  <span className="font-medium text-violet-300">📌 Source · page 12</span>
                  <p className="mt-1 italic text-white/50">
                    &ldquo;Enterprise segment expansion delivered $4.2M in net-new ARR, a 23%
                    increase from Q2&hellip;&rdquo;
                  </p>
                  <span className="mt-1.5 inline-block text-white/35">Relevance: 94%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
