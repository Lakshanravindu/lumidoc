"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-white/10 bg-[#050510]/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-sm">
            ✦
          </span>
          LumiDoc
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-white/70 transition-colors hover:text-white sm:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow hover:shadow-[0_0_32px_rgba(139,92,246,0.6)]"
          >
            Get started
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
