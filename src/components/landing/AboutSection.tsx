import Image from "next/image";
import { Leaf, CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="tentang" className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Visual Photo Card with Overlay */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative aspect-[4/4.2] w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/90 group">
              <Image
                src="/images/about-sorting.png"
                alt="Aktivitas pemilahan sampah rumah tangga"
                fill
                className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Bottom Overlay Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-black/60 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 border border-white/15 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#1E7E48] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#1E7E48]/30">
                  <Leaf className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-emerald-200 font-medium">
                    Kebiasaan berkelanjutan
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5 leading-snug">
                    Pemilahan dimulai dari lingkungan terdekat
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-right mt-2 pr-1">
              Foto: Vladislav Smigelski / Unsplash
            </p>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E7E48]">
                TENTANG SIMPANWASTE
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 leading-tight">
                Membangun kebiasaan memilah sampah melalui pengelolaan yang lebih terstruktur.
              </h2>
            </div>

            <p className="text-gray-600 text-base leading-relaxed">
              SIMPANWASTE merupakan sistem informasi berbasis web yang dirancang untuk
              membantu masyarakat dalam mengelola penyetoran sampah anorganik secara lebih
              mudah dan transparan.
            </p>

            <p className="text-gray-600 text-base leading-relaxed">
              Melalui satu platform, warga dapat memperoleh informasi pemilahan sampah,
              mengetahui lokasi bank sampah aktif, serta memantau hasil penyetoran mereka.
              Sistem ini juga membantu petugas dalam pencatatan penimbangan dan membantu
              pengelola memantau data sampah terkumpul.
            </p>

            {/* Highlight Box */}
            <div className="bg-[#EAF6EE] border border-[#C6E6D1] rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3.5 text-sm font-medium text-[#153626] shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[#1E7E48] shrink-0 mt-0.5 sm:mt-0" />
              <p className="leading-snug">
                Mendukung pengelolaan sampah anorganik berbasis pemilahan di Kota Palembang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

