import { Recycle, Send, Scale, Coins } from "lucide-react";

export default function StepsSection() {
  const steps = [
    {
      step: "LANGKAH 01",
      title: "Pilah Sampah dari Rumah",
      description: "Pisahkan sampah anorganik berdasarkan jenis dan kondisinya agar bersih.",
      icon: Recycle,
    },
    {
      step: "LANGKAH 02",
      title: "Buat Laporan Setoran",
      description: "Pilih metode pickup atau drop-off sesuai ketentuan estimasi berat sampah.",
      icon: Send,
    },
    {
      step: "LANGKAH 03",
      title: "Verifikasi & Penimbangan",
      description: "Petugas memeriksa kebersihan kondisi dan menimbang berat aktual secara manual.",
      icon: Scale,
    },
    {
      step: "LANGKAH 04",
      title: "Saldo Diperbarui",
      description: "Sistem menghitung nilai konversi otomatis dan menambahkannya ke saldo akun warga.",
      icon: Coins,
    },
  ];

  return (
    <section id="alur" className="py-16 lg:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E7E48]">
            ALUR PENYETORAN
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
            Empat langkah yang sederhana dan transparan
          </h2>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#1E7E48]/40 hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-extrabold tracking-wider text-[#1E7E48] bg-[#EAF6EE] px-3 py-1 rounded-full">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 group-hover:bg-[#1E7E48] group-hover:text-white group-hover:border-[#1E7E48] transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E7E48] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Proses alur terintegrasi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

