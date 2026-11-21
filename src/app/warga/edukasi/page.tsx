"use client";

import { useState } from "react";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Recycle,
  Boxes,
  Leaf,
  CheckCircle2,
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

  if (detail !== null) {
    const e = education[detail];
    return (
      <div className="mx-auto max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <button
            onClick={closeDetail}
            className="transition hover:text-green-700 cursor-pointer"
          >
            Informasi & Edukasi
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-700">{e.title}</span>
        </nav>

        <button
          onClick={closeDetail}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:-translate-x-0.5 hover:text-green-700 cursor-pointer"
        >
          <ArrowLeft size={17} /> Kembali ke edukasi
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
                  <section
                    key={section.heading}
                    className="grid gap-4 sm:grid-cols-[42px_1fr]"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-xs font-extrabold text-green-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        {section.heading}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {section.body}
                      </p>
                    </div>
                  </section>
                ))}
              </div>
              <aside className="h-fit rounded-2xl bg-[#edf8ef] p-5">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${e.color}`}
                >
                  <e.icon size={21} />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[.12em] text-green-700">
                  Catatan Penting
                </p>
                <p className="mt-2 text-sm leading-6 text-green-950">{e.note}</p>
              </aside>
            </div>
            <div className="mt-12 flex items-center justify-end border-t border-slate-200 pt-7">
              <Button onClick={closeDetail} className="cursor-pointer">
                <ArrowLeft size={17} /> Kembali ke Informasi & Edukasi
              </Button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="-m-4 sm:-m-7 lg:-m-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[#edf7f0] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-green-600" />
              <p className="text-xs font-extrabold tracking-[.16em] text-green-700">
                PANDUAN PENGELOLAAN SAMPAH
              </p>
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-.04em] text-slate-950 sm:text-5xl">
              Kenali Sampahmu, Mulai{" "}
              <span className="text-green-700">Perubahan dari Rumah.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Pelajari cara memilah, membersihkan, dan menyetorkan sampah dengan
              benar untuk mendukung lingkungan yang lebih bersih.
            </p>
          </div>

          <div className="relative mx-auto min-h-[330px] w-full max-w-xl sm:min-h-[390px]">
            <div className="absolute inset-[8%] rounded-[42%_58%_54%_46%/45%_38%_62%_55%] bg-green-800" />
            <div className="absolute left-[12%] top-[14%] h-28 w-28 rounded-full border-[20px] border-green-300/15 sm:h-36 sm:w-36" />
            <div className="absolute bottom-[13%] right-[9%] h-24 w-24 rounded-full bg-green-300/20" />

            <div className="absolute bottom-[17%] left-[12%] z-10">
              <div className="h-36 w-24 rounded-t-[2rem] rounded-b-xl bg-sky-200 shadow-xl sm:h-44 sm:w-28">
                <div className="mx-auto h-6 w-12 -translate-y-4 rounded-md bg-sky-600" />
                <Recycle className="mx-auto mt-6 text-sky-800" size={32} />
              </div>
            </div>
            <div className="absolute bottom-[13%] left-[37%] z-20">
              <div className="h-40 w-32 rotate-[-5deg] rounded-xl bg-amber-300 p-4 shadow-xl sm:h-48 sm:w-40">
                <div className="h-2 w-16 rounded-full bg-amber-700/30" />
                <div className="mt-3 h-2 w-10 rounded-full bg-amber-700/20" />
                <Boxes
                  className="absolute bottom-5 right-5 text-amber-800"
                  size={31}
                />
              </div>
            </div>
            <div className="absolute bottom-[19%] right-[11%] z-10">
              <div className="grid h-32 w-24 place-items-center rounded-b-2xl rounded-t-lg bg-emerald-200 shadow-xl sm:h-40 sm:w-28">
                <Leaf className="text-emerald-800" size={34} />
              </div>
            </div>
            <Recycle
              className="absolute right-[26%] top-[18%] z-20 text-green-100"
              size={72}
              strokeWidth={1.5}
            />
            <Leaf
              className="absolute left-[28%] top-[9%] z-20 rotate-[-20deg] text-green-300"
              size={43}
            />
          </div>
        </div>
      </section>

      {/* Main Educational Grid */}
      <section className="bg-[#f8faf8] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
              Pusat Pembelajaran
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Jelajahi Panduan Pemilahan
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Temukan informasi praktis mengenai pengelolaan sampah rumah tangga.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            {education.map((e, index) => (
              <button
                key={e.title}
                onClick={() => openDetail(index)}
                className={`group overflow-hidden rounded-[1.5rem] border border-slate-200/80 text-left shadow-[0_4px_20px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_18px_40px_rgba(22,101,52,.10)] cursor-pointer ${
                  index === 0 || index === 3 ? "lg:col-span-7" : "lg:col-span-5"
                } ${e.surface}`}
              >
                <div
                  className={`relative overflow-hidden ${
                    index === 0 || index === 3
                      ? "h-64 sm:h-72"
                      : "h-56 sm:h-64"
                  }`}
                >
                  <img
                    src={e.image}
                    alt={`Visual ${e.title.toLowerCase()}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-green-800 shadow-sm backdrop-blur">
                    {e.label}
                  </span>
                  <span className="absolute bottom-4 right-5 text-[9px] font-medium text-white/70">
                    {e.credit}
                  </span>
                </div>
                <div className="flex min-h-52 flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl ${e.color}`}
                    >
                      <e.icon size={21} />
                    </div>
                    <ArrowRight
                      className="mt-1 text-slate-400 transition duration-300 group-hover:translate-x-1 group-hover:text-green-700"
                      size={20}
                    />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {e.desc}
                  </p>
                  <p className="mt-auto pt-5 text-xs font-extrabold text-green-700">
                    Baca panduan lengkap
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Prep Notice Banner */}
          <aside className="mt-16 overflow-hidden rounded-[1.75rem] bg-green-800 text-white">
            <div className="grid items-center gap-8 px-6 py-9 sm:px-10 lg:grid-cols-[1fr_320px] lg:px-12 lg:py-10">
              <div>
                <div className="flex items-center gap-3 text-green-300">
                  <CheckCircle2 size={20} />
                  <p className="text-xs font-extrabold uppercase tracking-[.14em]">
                    Persiapan Setoran
                  </p>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Sebelum Menyetor, Pastikan Sampahmu Sudah Siap.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-green-100">
                  Pisahkan sampah anorganik berdasarkan jenisnya dan bersihkan
                  dari sisa kotoran atau cairan sebelum disetorkan.
                </p>
              </div>
              <div className="relative mx-auto flex h-40 w-full max-w-xs items-end justify-center gap-3">
                <div className="absolute left-3 top-4 h-20 w-20 rounded-full border-[14px] border-green-300/10" />
                <div className="relative h-24 w-16 rounded-t-xl rounded-b-md bg-sky-200 shadow-lg">
                  <div className="mx-auto h-4 w-8 -translate-y-2 rounded-sm bg-sky-500" />
                </div>
                <div className="relative h-28 w-24 rotate-[-4deg] rounded-md bg-amber-300 p-3 shadow-lg">
                  <div className="h-1.5 w-10 rounded bg-amber-700/25" />
                  <div className="mt-2 h-1.5 w-7 rounded bg-amber-700/20" />
                </div>
                <div className="relative grid h-20 w-16 place-items-center rounded-lg bg-green-200 shadow-lg">
                  <Recycle className="text-green-800" size={25} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
