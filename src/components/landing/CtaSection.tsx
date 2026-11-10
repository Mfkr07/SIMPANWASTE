import Link from "next/link";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#153626] text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl overflow-hidden border border-emerald-900/60">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-emerald-200 font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Gerakan Bersama Palembang Bersih</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Mulai Langkah Kecil untuk Lingkungan yang Lebih Baik.
            </h2>

            <p className="text-gray-200 mt-4 text-sm sm:text-base max-w-2xl leading-relaxed">
              Bergabung dengan SIMPANWASTE dan mulai kelola sampah anorganik secara lebih
              terstruktur, bermanfaat, dan bernilai ekonomis.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 w-full sm:w-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#153626] hover:bg-gray-100 font-bold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
              >
                <span>Daftar sebagai Warga</span>
                <ArrowRight className="w-4 h-4 text-[#153626]" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all backdrop-blur-sm w-full sm:w-auto"
              >
                <LogIn className="w-4 h-4 text-emerald-200" />
                <span>Masuk ke Sistem</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

