import SmoothScroll from "@/components/landing/SmoothScroll";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CookieConsent from "@/components/landing/CookieConsent";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <main className="grain lumi-bg min-h-screen text-paper selection:bg-gold/25 selection:text-paper">
        <Navbar />
        {children}
        <Footer />
      </main>
      <CookieConsent />
    </>
  );
}
