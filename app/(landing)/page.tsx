import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ChatPreview from "@/components/landing/ChatPreview";
import TechStack from "@/components/landing/TechStack";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050510] text-white selection:bg-violet-500/40">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturesGrid />
      <ChatPreview />
      <TechStack />
      <Footer />
    </main>
  );
}
