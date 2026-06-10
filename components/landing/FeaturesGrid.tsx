"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "📄",
    title: "20+ file formats",
    description:
      "PDF, DOCX, XLSX, PPTX, images, code files — even scanned documents via Vision OCR.",
  },
  {
    icon: "🔍",
    title: "Hybrid search",
    description:
      "Semantic vector search combined with keyword matching finds what either would miss alone.",
  },
  {
    icon: "📌",
    title: "Source citations",
    description:
      "Every answer links back to the exact passage and page it came from. Trust, but verify.",
  },
  {
    icon: "⚡",
    title: "Streaming responses",
    description: "Answers stream in token by token. No spinners, no waiting for walls of text.",
  },
  {
    icon: "🗂️",
    title: "Workspaces",
    description:
      "Group related documents and conversations. Query one file or an entire knowledge base.",
  },
  {
    icon: "🔒",
    title: "Private by design",
    description:
      "Row-level security, private storage buckets, signed URLs. Your documents stay yours.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative py-28">
      {/* section glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              know your docs
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/55">
            Built on a production-grade RAG pipeline — not a toy wrapper around a chat API.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.06] hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)]"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
