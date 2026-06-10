"use client";

import { motion } from "framer-motion";

const stack = [
  "Next.js 15",
  "Anthropic Claude",
  "Supabase pgvector",
  "Voyage AI",
  "Vercel AI SDK",
  "Tailwind CSS",
];

export default function TechStack() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-5xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center text-sm uppercase tracking-[0.2em] text-white/35"
        >
          Built with a modern stack
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-white/60 backdrop-blur transition-colors hover:border-white/25 hover:text-white"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
