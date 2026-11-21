"use client";

import { Leaf, Recycle } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="tentang" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:px-8">
        {/* Kolom Kiri: Visual Gambar Foto */}
        <div
          data-reveal
          className="reveal-card order-2 relative mx-auto w-full max-w-2xl lg:order-1"
        >
          <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-green-100/80 sm:-bottom-8 sm:-left-8 sm:h-44 sm:w-44 pointer-events-none" />
          <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border border-green-200 sm:-right-8 sm:-top-8 sm:h-32 sm:w-32 pointer-events-none" />
          <figure className="relative overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,.12)]">
            <img
              src="https://images.unsplash.com/photo-1654169695107-f5dfb47b9188?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"
              alt="Seseorang memilah material daur ulang ke dalam wadah di rumah"
              className="aspect-[4/5] w-full object-cover sm:aspect-[6/5] lg:aspect-[4/5]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <Leaf size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-green-100">
                    Kebiasaan berkelanjutan
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    Pemilahan dimulai dari lingkungan terdekat
                  </p>
                </div>
              </div>
            </figcaption>
          </figure>
        </div>

        {/* Kolom Kanan: Teks Penjelasan */}
        <div data-reveal className="reveal-card order-1 lg:order-2">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-green-600" />
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
              TENTANG SIMPANWASTE
            </p>
          </div>
          <h2 className="max-w-xl text-3xl font-extrabold leading-[1.13] tracking-[-.035em] text-slate-950 sm:text-4xl lg:text-[2.75rem]">
            Membangun kebiasaan memilah sampah melalui pengelolaan yang{" "}
            <span className="text-green-700">lebih terstruktur.</span>
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-600">
            SIMPANWASTE merupakan sistem informasi berbasis web yang dirancang untuk membantu
            masyarakat dalam mengelola penyetoran sampah anorganik secara lebih mudah dan
            transparan.
          </p>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Melalui satu platform, warga dapat memperoleh informasi pemilahan sampah, mengetahui
            jadwal operasional Bank Sampah Graha Pena, serta memantau hasil penyetoran mereka. Sistem ini juga
            membantu petugas dalam pencatatan penimbangan dan membantu pengelola memantau data
            sampah terkumpul.
          </p>
          <div className="mt-9 flex max-w-xl items-center gap-5 border-t border-slate-200 pt-6">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-50 text-green-700">
              <Recycle size={20} />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-700">
              Mendukung pengelolaan sampah anorganik berbasis pemilahan di Kota Palembang.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
