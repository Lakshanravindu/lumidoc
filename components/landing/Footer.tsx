"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-28">
      {/* final CTA */}
      <div className="mx-auto max-w-4xl px-6 pb-28 text-center">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold tracking-tight text-white md:text-5xl"
        >
          Stop searching.{" "}
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Start asking.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-md text-white/55"
        >
          Upload your first document and get answers in under a minute.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10"
        >
          <Link
            href="/register"
            className="inline-block rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-4 font-medium text-white shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.03] hover:shadow-[0_0_56px_rgba(139,92,246,0.7)]"
          >
            Get started — it&apos;s free
          </Link>
        </motion.div>
      </div>

      {/* footer bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-white/40 md:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px]">
              ✦
            </span>
            LumiDoc — AI Document Q&A
          </span>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Lakshanravindu/lumidoc"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://lakshanweerasinghe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
