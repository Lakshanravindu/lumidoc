import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import ContactForm from "@/components/legal/ContactForm";

export const metadata: Metadata = {
  title: "Contact · LumiDoc",
  description: "Get in touch with the LumiDoc team.",
};

export default function ContactPage() {
  return (
    <LegalShell
      eyebrow="Contact"
      title="Let's talk."
      intro="Questions about LumiDoc, data protection, or anything else? Send a message and we'll get back to you."
    >
      <ContactForm />

      <h2>Other ways to reach us</h2>
      <p>
        Prefer email? Write directly to <a href="mailto:hello@lumidoc.app">hello@lumidoc.app</a>.
        For privacy or data-protection requests, see our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>
    </LegalShell>
  );
}
