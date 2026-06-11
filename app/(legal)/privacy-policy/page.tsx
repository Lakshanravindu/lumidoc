import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy · LumiDoc",
  description: "How LumiDoc collects, uses, and protects your personal data under the GDPR.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This policy explains what personal data we collect, why, and the rights you have under the EU General Data Protection Regulation (GDPR)."
      updated="11 June 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        LumiDoc is the data controller for the personal data described in this policy. For any
        privacy enquiry, contact <a href="mailto:privacy@lumidoc.app">privacy@lumidoc.app</a>.
      </p>

      <h2>2. Data we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your email address and authentication details.
        </li>
        <li>
          <strong>Document content:</strong> the files you upload and the text extracted from them.
        </li>
        <li>
          <strong>Usage data:</strong> conversations, queries, and basic technical logs needed to
          operate and secure the Service.
        </li>
      </ul>

      <h2>3. How we use your data</h2>
      <p>We process your data to:</p>
      <ul>
        <li>Provide the core Service: indexing your documents and answering your questions.</li>
        <li>Authenticate you and keep your account secure.</li>
        <li>Maintain, debug, and improve the Service.</li>
      </ul>
      <p>
        We <strong>never</strong> use your documents or conversations to train AI models, and we do
        not sell your data to third parties.
      </p>

      <h2>4. Legal basis for processing</h2>
      <p>
        We process your data on the basis of <strong>contract</strong> (to deliver the Service you
        signed up for), <strong>legitimate interests</strong> (to secure and improve the Service),
        and <strong>consent</strong> where required (for example, optional analytics cookies).
      </p>

      <h2>5. Sub-processors</h2>
      <p>
        We rely on trusted infrastructure providers to operate LumiDoc, including cloud hosting,
        database and storage, and AI model providers. These parties process data only on our
        instructions and under appropriate data-protection agreements.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We keep your data for as long as your account is active. When you delete a document or your
        account, the associated content and embeddings are removed from our systems.
      </p>

      <h2>7. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Rectify inaccurate data.</li>
        <li>Erase your data (&ldquo;right to be forgotten&rdquo;).</li>
        <li>Export your data in a portable format.</li>
        <li>Restrict or object to certain processing.</li>
        <li>Lodge a complaint with your local data-protection authority.</li>
      </ul>
      <p>
        To exercise any of these rights, contact{" "}
        <a href="mailto:privacy@lumidoc.app">privacy@lumidoc.app</a>.
      </p>

      <h2>8. Security</h2>
      <p>
        We protect your data with encryption in transit, private storage buckets, signed URLs, and
        row-level security that fences every record to its owner at the database layer.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be communicated through
        the Service or by email.
      </p>
    </LegalShell>
  );
}
