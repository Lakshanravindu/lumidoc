"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "lumidoc-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // storage unavailable, stay hidden
    }
  }, []);

  const decide = (choice: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-2xl border border-paper/10 bg-ink-raised/95 p-5 shadow-[0_24px_70px_-12px_var(--lumi-shadow)] backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="text-sm leading-relaxed text-paper-dim">
              We use essential cookies to run LumiDoc, and optional ones to understand usage. See
              our{" "}
              <Link href="/cookies" className="text-gold underline-offset-2 hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => decide("rejected")}
                className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper-dim transition-colors hover:border-paper/30 hover:text-paper"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
