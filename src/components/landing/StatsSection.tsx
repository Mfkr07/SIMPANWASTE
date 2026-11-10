import { Recycle, ClipboardList, MapPin, Scale } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      value: "12,8 ton",
      label: "Total sampah terkumpul",
      description: "Sampah anorganik terkelola",
      icon: Recycle,
      isPrimary: true,
    },
    {
      value: "1.240+",
      label: "Jumlah setoran warga",
      description: "Transaksi tercatat di sistem",
      icon: ClipboardList,
      isPrimary: true,
    },
    {
      value: "8 lokasi",
      label: "Bank sampah aktif",
      description: "Titik operasional Palembang",
      icon: MapPin,
      isPrimary: true,
    },
    {
      value: "Timbang manual",
      label: "Diverifikasi langsung oleh petugas",
      description: "Pemeriksaan akurat & transparan",
      icon: Scale,
      isPrimary: false,
    },
  ];

  return (
    <section className="py-12 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E7E48]">
              GAMBARAN SISTEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Dampak yang dapat dipantau
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-500 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Statistik berikut merupakan data demonstrasi.</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-[#F8FAF9] border border-gray-200/80 hover:border-[#C6E6D1] rounded-2xl p-6 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 text-[#1E7E48] flex items-center justify-center group-hover:bg-[#EAF6EE] group-hover:border-[#C6E6D1] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-gray-100">
                    DEMO
                  </span>
                </div>
                <div>
                  <p
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      stat.isPrimary ? "text-[#1E7E48]" : "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1.5 leading-snug">
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

