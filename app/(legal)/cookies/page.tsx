import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Cookie Policy · LumiDoc",
  description: "How and why LumiDoc uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Cookie Policy"
      intro="This policy explains how LumiDoc uses cookies and similar technologies, and the choices available to you."
      updated="11 June 2026"
    >
      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the
        site work, remember your preferences, and understand how it is used.
      </p>

      <h2>2. How we use them</h2>
      <h3>Strictly necessary</h3>
      <p>
        These keep you signed in, maintain your session, and protect against security threats. The
        Service cannot function without them, so they do not require consent.
      </p>
      <h3>Preferences</h3>
      <p>
        These remember choices such as your cookie consent decision so we don&apos;t ask you on
        every visit.
      </p>
      <h3>Analytics (optional)</h3>
      <p>
        With your consent, we may use privacy-friendly analytics to understand which features are
        used and where the experience can improve. These are only set if you accept.
      </p>

      <h2>3. Managing your choices</h2>
      <p>
        When you first visit LumiDoc, a banner lets you accept or reject optional cookies. You can
        change your decision at any time by clearing the <strong>lumidoc-cookie-consent</strong>{" "}
        value in your browser storage, which will make the banner appear again.
      </p>
      <p>
        Most browsers also let you block or delete cookies through their settings. Note that
        blocking strictly necessary cookies may stop parts of the Service from working.
      </p>

      <h2>4. Contact</h2>
      <p>
        Questions about our use of cookies? Email{" "}
        <a href="mailto:privacy@lumidoc.app">privacy@lumidoc.app</a>.
      </p>
    </LegalShell>
  );
}
