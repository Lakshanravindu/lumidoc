import SmoothScroll from "@/components/landing/SmoothScroll";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ScrollStory from "@/components/landing/ScrollStory";
import Capabilities from "@/components/landing/Capabilities";
import AnswerDemo from "@/components/landing/AnswerDemo";
import FormatsMarquee from "@/components/landing/FormatsMarquee";
import Privacy from "@/components/landing/Privacy";
import Footer from "@/components/landing/Footer";
import CookieConsent from "@/components/landing/CookieConsent";

export default function LandingPage() {
  return (
    <>
      <SmoothScroll />
      <main className="grain lumi-bg min-h-screen text-paper selection:bg-gold/25 selection:text-paper">
        <Navbar />
        <Hero />
        <FormatsMarquee />
        <ScrollStory />
        <Capabilities />
        <AnswerDemo />
        <Privacy />
        <Footer />
      </main>
      <CookieConsent />
    </>
  );
}
