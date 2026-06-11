"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Privacy", href: "/#privacy" },
  { label: "About", href: "/about" },
];

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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-paper/10 bg-ink/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-medium tracking-tight text-paper">
            LumiDoc
          </span>
        </Link>

        <div className="hidden items-center gap-9 text-sm text-paper-dim md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-paper-dim transition-colors hover:text-paper sm:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            Get started
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

export function Logo() {
  return (
    <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-gold/25 to-transparent">
      <span className="absolute inset-0 rounded-xl bg-gold/15 blur-md" />
      <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-gold" fill="none">
        <path
          d="M12 2.5v19M5 6.5l14 11M5 17.5l14-11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      </svg>
    </span>
  );
}
