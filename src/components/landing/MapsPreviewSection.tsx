"use client";

import Link from "next/link";
import {
  MapPin,
  Clock3,
  CalendarDays,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Navigation,
} from "lucide-react";

export const grahaPenaLocation = {
  name: "Bank Sampah Graha Pena Palembang",
  shortName: "Bank Sampah Graha Pena",
  address:
    "Jl. Kolonel H. Barlian KM.6,5 No.773, Srijaya, Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan 30961",
  landmark: "Bersebelahan dengan Taman Wisata Punti Kayu.",
  weekdaySchedule: "09.00–16.00 WIB",
  saturdaySchedule: "Kegiatan rutin pemilahan sampah",
};

export default function MapsPreviewSection() {
  const encodedAddress = encodeURIComponent(grahaPenaLocation.address);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return (
    <section id="lokasi" className="scroll-mt-20 bg-[#f3f8f3] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Judul & Deskripsi Seksi */}
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
            Maps Bank Sampah
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Temukan lokasi penyetoran di Palembang
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Bank Sampah Graha Pena merupakan pusat operasional resmi SIMPANWASTE di Kota Palembang.
            Kunjungi lokasi kami untuk melakukan penyetoran sampah anorganik terpilah,
            penimbangan langsung, dan pencatatan saldo tabungan Anda.
          </p>
        </div>

        {/* Grid 2 Kolom: Kartu Penjelasan (Kiri) & Peta Bersih Google Maps (Kanan) */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[.85fr_1.15fr] items-start">
          {/* Kolom Kiri: Kartu Informasi Lengkap Bank Sampah Graha Pena */}
          <div data-reveal className="reveal-card">
            <article className="rounded-2xl border-2 border-green-600 bg-green-50/70 p-6 shadow-[0_12px_36px_rgba(22,101,52,.09)] backdrop-blur-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-green-800 text-white shadow-sm">
                  <MapPin size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-800 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white">
                      Pusat Operasional SIMPANWASTE
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                      <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                      Operasional Aktif
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-900 leading-snug">
                    {grahaPenaLocation.name}
                  </h3>
                </div>
              </div>

              {/* Detail Alamat & Landmark */}
              <div className="mt-5 border-t border-green-200/60 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-800">
                  Alamat Lengkap
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">
                  {grahaPenaLocation.address}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600 bg-white/80 px-3 py-1.5 rounded-lg border border-green-100 inline-block">
                  <span className="font-semibold text-slate-800">Landmark:</span>{" "}
                  {grahaPenaLocation.landmark}
                </p>
              </div>

              {/* Jadwal Operasional */}
              <div className="mt-5 rounded-xl border border-green-200/80 bg-white p-4 space-y-2.5">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Jadwal Operasional
                </p>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="flex items-center gap-2 font-semibold">
                    <Clock3 size={15} className="text-green-700 shrink-0" />
                    <span>Senin–Jumat: {grahaPenaLocation.weekdaySchedule}</span>
                  </p>
                  <p className="flex items-center gap-2 font-semibold">
                    <CalendarDays size={15} className="text-green-700 shrink-0" />
                    <span>Sabtu: {grahaPenaLocation.saturdaySchedule}</span>
                  </p>
                </div>
              </div>

              {/* Fasilitas & Layanan */}
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Layanan di Lokasi
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-700 shrink-0" />
                    <span>Drop-off sampah anorganik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-700 shrink-0" />
                    <span>Penimbangan langsung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-700 shrink-0" />
                    <span>Pencatatan saldo digital</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-700 shrink-0" />
                    <span>Konsultasi pemilahan</span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-3 border-t border-green-200/60">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-green-800 shadow-sm active:scale-[.98]"
                >
                  Buka di Google Maps <ExternalLink size={14} />
                </a>
                <Link
                  href="/alur-penyetoran"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-2.5 text-xs font-bold text-green-800 transition hover:bg-green-50 active:scale-[.98]"
                >
                  Panduan Setor <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          </div>

          {/* Kolom Kanan: Peta Google Maps Embed (Bebas dari Overlay yang Menutupi UI Peta) */}
          <div
            data-reveal
            className="reveal-card rounded-[2rem] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xl lg:sticky lg:top-24"
          >
            {/* Header Keterangan Peta (Di Atas Peta, Tidak Menutup Maps) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
                  <Navigation size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                      Peta Lokasi Graha Pena
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                      Live Map
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                    Jl. Kolonel H. Barlian KM.6,5 No.773 · Punti Kayu, Palembang
                  </p>
                </div>
              </div>

              {/* Tombol Petunjuk Arah */}
              <a
                href={googleMapsDirUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-green-800 shadow-sm active:scale-[.98]"
              >
                <span>Petunjuk Arah</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Bingkai Iframe Google Maps (100% Bersih, Jelas, Kontrol UI Maps Utuh) */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title={`Peta Lokasi ${grahaPenaLocation.name}`}
                src={`https://www.google.com/maps?q=${encodedAddress}&z=16&output=embed`}
                className="h-[460px] sm:h-[500px] w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Catatan Kaki Peta (Di Bawah Peta, Menjelaskan Navigasi Tanpa Menutupi Kontrol Maps) */}
            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-600 ring-4 ring-green-100" />
                <span className="font-semibold text-slate-700">Titik Koordinat Resmi Bank Sampah Graha Pena</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gunakan kontrol pada peta untuk memperbesar/memperkecil tampilan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
