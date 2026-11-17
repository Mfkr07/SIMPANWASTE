"use client";

import { Recycle, ClipboardList, Scale, WalletCards } from "lucide-react";

export default function StepsSection() {
  const steps = [
    {
      number: "01",
      title: "Pilah Sampah dari Rumah",
      desc: "Pisahkan sampah anorganik berdasarkan jenisnya.",
      icon: Recycle,
    },
    {
      number: "02",
      title: "Buat Laporan Setoran",
      desc: "Pilih pickup atau drop-off sesuai ketentuan berat.",
      icon: ClipboardList,
    },
    {
      number: "03",
      title: "Verifikasi & Penimbangan",
      desc: "Petugas memeriksa kondisi dan menimbang secara manual.",
      icon: Scale,
    },
    {
      number: "04",
      title: "Saldo Diperbarui",
      desc: "Sistem menghitung nilai dan memperbarui saldo warga.",
      icon: WalletCards,
    },
  ];

  return (
    <section id="alur" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
            Alur penyetoran
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Empat langkah yang sederhana dan transparan
          </h2>
        </div>
        <div className="relative mt-14 grid gap-5 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-green-200 md:block" />
          {steps.map(({ number, title, desc, icon: Icon }) => (
            <div
              key={number}
              data-reveal
              className="reveal-card relative flex gap-4 md:block"
            >
              <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-green-700 text-white shadow-md">
                <Icon size={21} />
              </div>
              <div className="md:mt-6">
                <p className="text-xs font-extrabold text-green-700">
                  LANGKAH {number}
                </p>
                <h3 className="mt-2 font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
