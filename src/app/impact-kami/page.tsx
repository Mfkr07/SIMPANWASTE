"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BarChart3, Truck, Building2, FileText } from "lucide-react";

export default function ImpactKamiPage() {
  const monthlyWaste = [620, 710, 680, 820, 910, 870, 1020, 960, 1110, 1180, 1240, 1360];
  const maxWaste = Math.max(...monthlyWaste);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">
      <Navbar activePath="/impact-kami" />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#eaf6ed] px-5 py-16 sm:py-24 lg:px-8">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[56px] border-green-600/[.06] pointer-events-none" />
          <div className="relative mx-auto flex max-w-7xl items-center gap-6">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-700 text-white shadow-lg">
              <BarChart3 size={26} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-green-700">
                IMPACT KAMI
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-5xl">
                Dampak yang tumbuh dari kebiasaan memilah.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Ringkasan berikut menggunakan data demonstrasi sampai angka operasional terverifikasi tersedia.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Numbers */}
        <section className="px-5 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "1.240+", label: "Nasabah" },
                { value: "18", label: "Mitra" },
                { value: "12.840 kg", label: "Sampah terkelola" },
                { value: "Rp48,6 jt", label: "Dibagikan ke nasabah" },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                  <p className="text-3xl font-extrabold text-green-800">{value}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-amber-700">
              Data demonstrasi · terakhir diperbarui Desember 2025
            </p>

            {/* Monthly Bar Chart Card */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Total Sampah Terkumpul dalam 1 Tahun</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Bank Sampah Graha Pena · kilogram per bulan · data demonstrasi
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/15">
                  Total 11.480 kg
                </span>
              </div>
              <div className="mt-8 flex h-72 items-end gap-2 sm:gap-4 border-b border-slate-100 pb-2">
                {monthlyWaste.map((value, index) => (
                  <div key={months[index]} className="flex h-full flex-1 flex-col justify-end">
                    <div
                      className="group relative rounded-t-lg bg-green-600 transition hover:bg-green-700"
                      style={{ height: `${(value / maxWaste) * 100}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white group-hover:block z-10 shadow-sm">
                        {value} kg
                      </span>
                    </div>
                    <p className="mt-2 text-center text-[9px] font-semibold text-slate-400 sm:text-[10px]">
                      {months[index]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Konversi Dampak & Mitra */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Truck size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Konversi Dampak</h2>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  Konversi truk sampah dan emisi CO₂ menunggu metodologi serta data terverifikasi.
                </p>
              </section>

              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Building2 size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Mitra</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Sumatera Ekspres",
                    "DLH Palembang",
                    "Disdik",
                    "PTPN I Regional 7",
                    "PHM Hotels",
                  ].map((partner) => (
                    <span
                      key={partner}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-amber-700">
                  Daftar usulan; status kerja sama perlu dikonfirmasi.
                </p>
              </section>
            </div>

            {/* Cerita, Berita & Galeri */}
            <section className="mt-12">
              <h2 className="text-2xl font-extrabold text-slate-900">Cerita, Berita & Galeri</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {["Testimoni nasabah", "Berita terbaru", "Galeri kegiatan"].map((title) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white"
                  >
                    <FileText className="mx-auto text-slate-300" size={32} />
                    <h3 className="mt-4 font-extrabold text-slate-900">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Konten terverifikasi belum tersedia.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
