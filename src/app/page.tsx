import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import AboutSection from "@/components/landing/AboutSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StepsSection from "@/components/landing/StepsSection";
import MapsPreviewSection from "@/components/landing/MapsPreviewSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#1E7E48] selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar />

      {/* Main Landing Page Content */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Gambaran Sistem (Statistik Dampak) */}
        <StatsSection />

        {/* 3. Tentang SIMPANWASTE */}
        <AboutSection />

        {/* 4. Fitur Utama */}
        <FeaturesSection />

        {/* 5. Alur Penyetoran */}
        <StepsSection />

        {/* 6. Bank Sampah Aktif & Pratinjau Maps */}
        <MapsPreviewSection />

        {/* 7. Banner Aksi (CTA) */}
        <CtaSection />
      </main>

      {/* Institutional Dark Footer */}
      <Footer />
    </div>
  );
}
