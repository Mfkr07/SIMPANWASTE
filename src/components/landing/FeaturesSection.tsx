"use client";

import { BookOpen, ClipboardList, MapPin, WalletCards } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Informasi & Edukasi Pemilahan",
      desc: "Panduan membersihkan, memilah, dan menyiapkan sampah sebelum disetor.",
      icon: BookOpen,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pelaporan Setoran Sampah",
      desc: "Buat laporan pickup atau drop-off sesuai estimasi berat sampah.",
      icon: ClipboardList,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      title: "Maps Bank Sampah",
      desc: "Temukan lokasi, alamat, dan jam operasional bank sampah yang tersedia.",
      icon: MapPin,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Saldo & Riwayat Transaksi",
      desc: "Pantau hasil setoran dan transaksi pribadi dengan perlindungan PIN.",
      icon: WalletCards,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <section id="fitur" className="scroll-mt-20 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
            Fitur utama
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Dirancang untuk mendukung alur yang nyata
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Fitur yang relevan bagi warga dalam mengelola setoran sampah anorganik.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, desc, icon: Icon, tone }) => (
            <article
              key={title}
              data-reveal
              className="reveal-card group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
                <Icon size={22} />
              </div>
              <h3 className="mt-6 text-lg font-extrabold leading-snug text-slate-900">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
