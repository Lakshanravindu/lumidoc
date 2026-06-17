"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "./Navbar";

const ease = [0.22, 1, 0.36, 1] as const;

const columns = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Capabilities", href: "/#capabilities" },
      { label: "Privacy", href: "/#privacy" },
      { label: "Get started", href: "/register" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-28">
      {/* final CTA */}
      <div className="relative mx-auto max-w-4xl px-6 pb-28 text-center">
        <div className="pointer-events-none absolute bottom-10 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gold/10 blur-[150px]" />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease }}
          className="font-display text-4xl font-light leading-tight tracking-tight text-paper md:text-6xl"
        >
          Stop searching.
          <br />
          <span className="italic text-gold-soft">Start asking.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mx-auto mt-6 max-w-md text-paper-dim"
        >
          Upload your first document and get a cited answer in under a minute.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mt-10"
        >
          <Link
            href="/register"
            className="group relative inline-flex overflow-hidden rounded-full bg-paper px-8 py-4 font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            <span className="relative z-10">Get started, it&apos;s free</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold-soft to-gold transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
        </motion.div>
      </div>

      {/* footer columns */}
      <div className="relative border-t border-paper/10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <Logo />
                <span className="font-display text-lg font-medium text-paper">LumiDoc</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-faint">
                AI document Q&amp;A with answers you can trust. Every reply backed by its source.
              </p>
            </div>

            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-paper-faint">
                  {col.heading}
                </h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-paper-dim transition-colors hover:text-paper"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-paper/[0.07] pt-8 text-sm text-paper-faint md:flex-row">
            <span>© {new Date().getFullYear()} LumiDoc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/Lakshanravindu/lumidoc"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-paper"
              >
                GitHub
              </a>
              <a
                href="https://lakshanweerasinghe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-paper"
              >
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
