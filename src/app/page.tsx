"use client";

import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProgramTabunganSection from "@/components/landing/ProgramTabunganSection";
import StatsSection from "@/components/landing/StatsSection";
import AboutSection from "@/components/landing/AboutSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StepsSection from "@/components/landing/StepsSection";
import MapsPreviewSection from "@/components/landing/MapsPreviewSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-800">
      {/* 1. Header / Navbar */}
      <Navbar activePath="/" />

      <main>
        {/* 2. Hero Section dengan LandingIllustration & Floating Badges */}
        <HeroSection />

        {/* 3. Program Tabungan (Tabungan Sampah, Pendidikan, Kurban, Umroh) */}
        <ProgramTabunganSection />

        {/* 4. Gambaran Sistem (Statistik Demonstrasi) */}
        <StatsSection />

        {/* 5. Tentang SIMPANWASTE */}
        <AboutSection />

        {/* 6. Fitur Utama */}
        <FeaturesSection />

        {/* 7. Alur Penyetoran (4 Langkah) */}
        <StepsSection />

        {/* 8. Maps Bank Sampah Interaktif Palembang (Graha Pena & Referensi) */}
        <MapsPreviewSection />

        {/* 9. Bersama Untuk Lingkungan Banner (CTA Section) */}
        <CtaSection />
      </main>

      {/* 10. Footer Publik */}
      <Footer />
    </div>
  );
}
