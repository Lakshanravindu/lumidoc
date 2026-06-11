"use client";

import { useState } from "react";

const CONTACT_EMAIL = "hello@lumidoc.app";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ready">("idle");

  const fieldClass =
    "w-full rounded-xl border border-paper/12 bg-paper/[0.03] px-4 py-3 text-sm text-paper placeholder:text-paper-faint outline-none transition-colors focus:border-gold/50";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`LumiDoc enquiry from ${name || email}`);
    const body = encodeURIComponent(`${message}\n\n${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("ready");
  };

  return (
    <form onSubmit={onSubmit} className="not-prose space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-paper-dim">Name</span>
          <input name="name" type="text" required placeholder="Jane Doe" className={fieldClass} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-paper-dim">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="jane@company.com"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm text-paper-dim">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className={`${fieldClass} resize-none`}
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-paper px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
      >
        Send message
      </button>
      {status === "ready" && (
        <p className="text-sm text-gold">
          Your email client should have opened. If not, write to {CONTACT_EMAIL}.
        </p>
      )}
    </form>
  );
}
