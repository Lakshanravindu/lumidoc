import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "About · LumiDoc",
  description: "Why LumiDoc exists: trustworthy answers from your own documents.",
};

export default function AboutPage() {
  return (
    <LegalShell
      eyebrow="About"
      title="Answers you can trace."
      intro="LumiDoc turns your documents into a source you can question, and every answer it gives points straight back to the page it came from."
    >
      <h2>Why we built it</h2>
      <p>
        Most AI tools are confident and unaccountable. They produce fluent answers with no way to
        check them. For anything that matters, like a contract, a financial report, or a research
        paper, that&apos;s not good enough.
      </p>
      <p>
        LumiDoc takes the opposite stance. It reads your documents, retrieves the exact passages
        relevant to your question, and answers <strong>with the receipt attached</strong>: the
        source, the page, and a relevance score. Trust, but verify, in one click.
      </p>

      <h2>How it works</h2>
      <p>
        Under the hood, LumiDoc runs a production-grade retrieval pipeline. Documents are read and
        split into overlapping passages, each turned into a vector that captures its meaning. Your
        question retrieves the closest passages through a hybrid of semantic and keyword search, and
        a large language model composes the answer strictly from that context.
      </p>

      <h2>Who makes it</h2>
      <p>
        LumiDoc is an independent project by Lakshan Weerasinghe, built and maintained in the open.
        It&apos;s designed for European users, with GDPR compliance and data protection treated as
        core architecture rather than an afterthought.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions, feedback, or partnership ideas are always welcome. Reach us through the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalShell>
  );
}
