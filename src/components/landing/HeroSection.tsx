"use client";

import Link from "next/link";
import { Leaf, ArrowRight, Clock3, MapPin, Phone, Recycle, Scale } from "lucide-react";
import LandingIllustration from "./LandingIllustration";

export default function HeroSection() {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/628127128799?text=Halo%20Bank%20Sampah%20Graha%20Pena,%20saya%20ingin%20menyetor%20sampah",
      "_blank"
    );
  };

  return (
    <section id="beranda" className="relative scroll-mt-20 overflow-hidden bg-[#f7fbf7]">
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-green-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl pointer-events-none" />

      <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:py-20">
        {/* Kolom Kiri: Teks & CTA */}
        <div className="landing-intro">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-700 shadow-sm">
            <Leaf size={15} /> Sistem pengelolaan sampah berbasis pemilahan
          </div>

          <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-.04em] text-slate-950 sm:text-5xl lg:text-6xl">
            Ubah Sampah Jadi <span className="text-green-700">Tabungan.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Bank Sampah Graha Pena, binaan Sumatera Ekspres, Palembang.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800 transition active:scale-[.98]"
            >
              Setor via WhatsApp <ArrowRight size={18} />
            </button>
            <Link
              href="/alur-penyetoran"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[.98]"
            >
              Lihat Cara Setor <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-green-100 bg-white/80 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="flex items-center gap-2">
              <Clock3 size={16} className="text-green-600" /> Senin–Jumat 09.00–16.00
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-green-600" /> Palembang
            </span>
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-green-600" /> WhatsApp: +62 812-7128-799
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Ilustrasi Vektor & Floating Cards */}
        <div className="landing-illustration relative mx-auto w-full max-w-[680px]">
          <div className="absolute inset-x-[12%] bottom-[6%] h-20 rounded-full bg-green-900/10 blur-2xl" />
          <LandingIllustration />

          {/* Floating Card: Setoran Tercatat */}
          <div className="absolute left-0 top-[22%] rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-700">
                <Recycle size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400">Setoran tercatat</p>
                <p className="text-sm font-extrabold text-slate-900">+8,4 kg</p>
              </div>
            </div>
          </div>

          {/* Floating Card: Proses Terverifikasi */}
          <div className="absolute bottom-[12%] right-0 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Scale size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400">Proses terverifikasi</p>
                <p className="text-sm font-extrabold text-slate-900">Timbang manual</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
