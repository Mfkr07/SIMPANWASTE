import { BookOpen, ClipboardList, MapPin, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturesSection() {
  const features = [
    {
      title: "Informasi & Edukasi Pemilahan",
      description:
        "Panduan membersihkan, memilah, dan menyiapkan sampah sebelum disetor agar nilai ekonomisnya optimal.",
      icon: BookOpen,
      href: "#alur",
    },
    {
      title: "Pelaporan Setoran Sampah",
      description:
        "Buat laporan pickup atau drop-off sesuai estimasi berat sampah dengan antarmuka yang ramah dan cepat.",
      icon: ClipboardList,
      href: "/register",
    },
    {
      title: "Maps Bank Sampah",
      description:
        "Temukan lokasi, alamat, dan jam operasional bank sampah yang tersedia secara interaktif di wilayah Palembang.",
      icon: MapPin,
      href: "#maps",
    },
    {
      title: "Saldo & Riwayat Transaksi",
      description:
        "Pantau hasil setoran dan transaksi tabungan pribadi secara transparan dengan proteksi keamanan PIN 6 angka.",
      icon: Wallet,
      href: "/login",
    },
  ];

  return (
    <section id="fitur" className="py-16 lg:py-24 bg-[#F8FAF9] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E7E48]">
            FITUR UTAMA
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
            Dirancang untuk mendukung alur yang nyata
          </h2>
          <p className="text-base text-gray-600 mt-3 max-w-xl mx-auto">
            Fitur yang relevan bagi warga dalam mengelola setoran sampah anorganik.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#1E7E48]/40 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF6EE] text-[#1E7E48] group-hover:bg-[#1E7E48] group-hover:text-white transition-colors flex items-center justify-center mb-5 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E7E48] transition-colors leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#1E7E48]">
                  <span>Jelajahi alur</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

