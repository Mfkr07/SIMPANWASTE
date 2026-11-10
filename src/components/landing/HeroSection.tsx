import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Scale, Sparkles, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="hero" className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 -ml-24 w-80 h-80 rounded-full bg-green-50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 bg-[#EAF6EE] text-[#1E7E48] border border-[#C6E6D1] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#1E7E48]" />
              <span>Sistem pengelolaan sampah berbasis pemilahan</span>
            </div>

            {/* Display Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-gray-900 leading-[1.15]">
              Pilah Hari Ini,<br />
              <span className="text-[#1E7E48]">Hijaukan Masa Depan.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
              Mulai kebiasaan memilah sampah dari rumah. Setorkan sampah anorganik bernilai
              ekonomis dan pantau hasilnya melalui SIMPANWASTE.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#1E7E48] hover:bg-[#18663A] text-white text-base font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-[#1E7E48]/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#tentang"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 text-base font-medium px-6 py-3.5 rounded-xl transition-all w-full sm:w-auto"
              >
                <span>Pelajari Sistem</span>
              </a>
            </div>

            {/* Trust / Feature Bullets */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs sm:text-sm font-medium text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E48] shrink-0" />
                <span>Pemilahan anorganik</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E48] shrink-0" />
                <span>Penimbangan manual</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E48] shrink-0" />
                <span>Saldo transparan</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic Card with Interactive Overlays */}
          <div className="lg:col-span-5 relative w-full flex flex-col items-center">
            <div className="relative w-full max-w-[480px] lg:max-w-none aspect-[4/3.8] rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xl bg-gradient-to-br from-emerald-50/70 via-white to-[#EAF6EE]/50 p-2">
              <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-white/60">
                <Image
                  src="/images/hero-figma-card.png"
                  alt="Ilustrasi SIMPANWASTE Palembang"
                  fill
                  className="object-cover object-center"
                  priority
                />

                {/* Floating Badge 1: Setoran Tercatat (Top Left) */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/95 backdrop-blur-md border border-emerald-100 shadow-xl rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-500">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#1E7E48] flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 leading-tight">
                      Setoran tercatat
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#1E7E48] leading-tight mt-0.5">
                      +8,4 kg
                    </p>
                  </div>
                </div>

                {/* Floating Badge 2: Proses Terverifikasi (Bottom Right) */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-md border border-emerald-100 shadow-xl rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="w-10 h-10 rounded-xl bg-[#153626] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 leading-tight">
                      Proses terverifikasi
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight mt-0.5">
                      Timbang manual
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note below card */}
            <p className="text-[11px] text-gray-400 text-right w-full mt-2 pr-1">
              Data di bawah menggunakan data demonstrasi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

