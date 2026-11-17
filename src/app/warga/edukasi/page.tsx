"use client";

import { useState } from "react";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/warga/WargaUI";
import { education } from "@/data/wargaSeedData";

export default function WargaEducationPage() {
  const [detail, setDetail] = useState<number | null>(null);

  const openDetail = (index: number) => {
    setDetail(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDetail = () => {
    setDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Full Article Detail View
  if (detail !== null) {
    const e = education[detail];
    return (
      <div className="mx-auto max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <button onClick={closeDetail} className="transition hover:text-green-700 cursor-pointer">
            Informasi & Edukasi
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-700">{e.title}</span>
        </nav>

        <button
          onClick={closeDetail}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:-translate-x-0.5 hover:text-green-700 cursor-pointer"
        >
          <ArrowLeft size={17} />
          <span>Kembali ke edukasi</span>
        </button>

        <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,.07)]">
          <div className="relative h-72 overflow-hidden sm:h-[420px]">
            <img
              src={e.image}
              alt={`Ilustrasi ${e.title.toLowerCase()}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.13em] backdrop-blur">
                  {e.label}
                </span>
                <span className="text-xs text-white/70">{e.tag}</span>
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {e.title}
              </h1>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
            <p className="max-w-3xl text-lg leading-8 text-slate-600">{e.intro}</p>
            <div className="mt-10 grid gap-10 border-t border-slate-200 pt-10 lg:grid-cols-[1fr_260px]">
              <div className="space-y-10">
                {e.sections.map((section, index) => (
                  <section key={section.heading} className="grid gap-4 sm:grid-cols-[42px_1fr]">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-xs font-extrabold text-green-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        {section.heading}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                    </div>
                  </section>
                ))}
              </div>

              <aside className="h-fit rounded-2xl bg-[#edf8ef] p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${e.color}`}>
                  <e.icon size={21} />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[.12em] text-green-700">
                  Catatan Penting
                </p>
                <p className="mt-2 text-sm leading-6 text-green-950">{e.note}</p>
              </aside>
            </div>

            <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-medium text-slate-400">Foto: {e.credit}</p>
              <Button onClick={closeDetail} className="cursor-pointer">
                <ArrowLeft size={17} />
                <span>Kembali ke Informasi & Edukasi</span>
              </Button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Topic Catalog View
  return (
    <div className="space-y-10">
      {/* Intro Header */}
      <section className="relative overflow-hidden rounded-3xl bg-[#edf7f0] p-6 sm:p-10 lg:p-12 border border-green-100">
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-green-800 shadow-xs mb-4">
            <BookOpen size={15} />
            <span>Pojok Literasi & Edukasi</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Panduan Pemilahan Sampah Mandiri
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-7 text-slate-600">
            Pelajari tata cara pemilahan dari rumah, cara mengolah sampah organik, serta alur
            penyetoran sampah anorganik terpilah di Kota Palembang.
          </p>
        </div>
      </section>

      {/* Grid of Education Topics */}
      <div className="grid gap-6 sm:grid-cols-2">
        {education.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              onClick={() => openDetail(idx)}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-xs transition hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-white/80">{item.tag}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Modul 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-green-700 transition">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-green-700">
                  <span>Baca panduan lengkap</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

