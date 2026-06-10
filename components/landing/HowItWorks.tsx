"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Upload anything",
    description:
      "Drag in PDFs, Word docs, spreadsheets, slides, images, or code. LumiDoc extracts and indexes every word — even from scanned pages.",
    accent: "from-violet-500 to-purple-400",
  },
  {
    number: "02",
    title: "Ask in plain language",
    description:
      "No keywords, no syntax. Ask questions the way you'd ask a colleague — across one document or your entire workspace.",
    accent: "from-blue-500 to-violet-400",
  },
  {
    number: "03",
    title: "Get cited answers",
    description:
      "Every answer comes with sources: the exact passage, page number, and relevance score. Verify in one click.",
    accent: "from-cyan-400 to-blue-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            From file to answer in{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              three steps
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span
                className={`bg-gradient-to-r text-5xl font-bold ${step.accent} bg-clip-text text-transparent opacity-60 transition-opacity group-hover:opacity-100`}
              >
                {step.number}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-white/55">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
