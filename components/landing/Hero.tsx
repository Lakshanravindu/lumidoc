"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* ambient glow orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-600/15 blur-[100px]" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-24 lg:grid-cols-2 lg:pt-16">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            Powered by Claude + RAG
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Chat with your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              documents.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg text-white/60"
          >
            Upload PDFs, spreadsheets, slides, or images — and get precise, cited answers in
            seconds. No more digging. Just ask.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-7 py-3.5 font-medium text-white shadow-[0_0_32px_rgba(139,92,246,0.45)] transition-all hover:scale-[1.03] hover:shadow-[0_0_48px_rgba(139,92,246,0.65)]"
            >
              Start for free
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex items-center gap-6 text-sm text-white/40"
          >
            <span>20+ file formats</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Source citations</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Private by design</span>
          </motion.div>
        </div>

        <div className="relative hidden h-[560px] lg:block" aria-hidden>
          {/* glow behind the 3D core */}
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/30 blur-[90px]" />
          <Scene3D />
        </div>
      </div>
    </section>
  );
}
