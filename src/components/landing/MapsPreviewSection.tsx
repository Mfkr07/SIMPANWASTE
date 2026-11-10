import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowRight, Info, CheckCircle2, Navigation } from "lucide-react";

export default function MapsPreviewSection() {
  const bankSampahList = [
    {
      name: "Bank Sampah Sejahtera",
      address: "Jl. Merdeka No. 24, Bukit Kecil",
      hours: "Sen–Sab, 08.00–15.00",
      status: "Aktif",
    },
    {
      name: "Bank Sampah Melati",
      address: "Jl. Demang Lebar Daun, Ilir Barat I",
      hours: "Sel–Min, 07.30–14.00",
      status: "Aktif",
    },
    {
      name: "Bank Sampah Kalidoni Hijau",
      address: "Jl. Mayor Zen No. 18, Kalidoni",
      hours: "Sen–Jum, 08.00–16.00",
      status: "Aktif",
    },
  ];

  return (
    <section id="maps" className="py-16 lg:py-24 bg-[#F4F8F5] border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Information & Waste Bank Directory */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E7E48]">
                BANK SAMPAH AKTIF
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 leading-tight">
                Temukan lokasi penyetoran di Palembang
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
                Lihat lokasi yang tersedia beserta alamat dan jam operasionalnya. Data berikut
                mengikuti data demonstrasi yang digunakan di dalam aplikasi.
              </p>
            </div>

            {/* Demo Notice Box */}
            <div className="bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-600 my-5 flex items-center gap-2.5 shadow-xs">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data berikut mengikuti data demonstrasi yang digunakan di dalam sistem.</span>
            </div>

            {/* Waste Bank Cards List */}
            <div className="space-y-3.5">
              {bankSampahList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-sm hover:border-[#1E7E48]/40 hover:shadow transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF6EE] text-[#1E7E48] group-hover:bg-[#1E7E48] group-hover:text-white transition-colors flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#1E7E48] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {item.address}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.hours}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 border border-green-200 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Login to Open Maps Action Button */}
            <div className="mt-7">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#1E7E48] hover:bg-[#18663A] text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-[#1E7E48]/20 hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Masuk untuk Buka Maps</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-gray-400 mt-2">
                * Peta interaktif lengkap dan fitur navigasi rute hanya dapat diakses setelah masuk ke akun.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Map Preview */}
          <div className="lg:col-span-6 relative w-full flex flex-col items-center">
            <div className="relative w-full aspect-[4/3.8] rounded-3xl overflow-hidden border border-gray-200/90 shadow-xl bg-[#E6F0EA] p-3 flex flex-col justify-between">
              {/* Genuine Figma Maps Preview Image */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner bg-white/40">
                <Image
                  src="/images/maps-preview.png"
                  alt="Pratinjau Peta Bank Sampah Palembang"
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* Bottom Floating Map Information Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-200/80 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1E7E48] text-white flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      Area Pilot: Kota Palembang
                    </p>
                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                      Pusat sebaran bank sampah terdata
                    </p>
                  </div>
                </div>

                <div className="bg-[#EAF6EE] border border-[#C6E6D1] text-[#1E7E48] text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                  8 Titik Tersedia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

