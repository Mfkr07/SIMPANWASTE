"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="bg-white px-5 py-20 sm:py-28 lg:px-8">
      <div
        data-reveal
        className="reveal-card relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#086337] text-white shadow-[0_30px_80px_rgba(8,99,55,.2)] lg:grid-cols-[1.08fr_.92fr]"
      >
        <div className="absolute -left-32 -top-36 h-96 w-96 rounded-full border-[68px] border-white/[.045] pointer-events-none" />
        <div className="absolute -bottom-44 left-[36%] h-96 w-96 rounded-full border-[58px] border-green-300/[.07] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center px-7 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-green-300" />
            <p className="text-xs font-extrabold tracking-[.17em] text-green-200">
              BERSAMA UNTUK LINGKUNGAN
            </p>
          </div>
          <h2 className="mt-6 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-[-.035em] sm:text-4xl lg:text-5xl">
            Mulai Langkah Kecil, Ciptakan{" "}
            <span className="text-green-300">Perubahan Besar.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-green-50/85">
            Bergabung dengan SIMPANWASTE dan mulai kelola sampah anorganik secara lebih
            terstruktur. Setiap langkah pemilahan berarti bagi lingkungan yang lebih baik.
          </p>
          <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="visible inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-200 px-6 py-3 text-sm font-extrabold text-green-950 opacity-100 shadow-[0_12px_30px_rgba(0,0,0,.12)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[.98] sm:w-auto"
            >
              <span className="visible opacity-100">Daftar Sekarang</span>
              <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-2 py-3 text-sm font-semibold text-green-100 transition hover:text-white sm:justify-start"
            >
              Sudah punya akun?{" "}
              <span className="font-extrabold underline decoration-green-300/60 underline-offset-4">
                Masuk
              </span>
            </Link>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-green-950/10 sm:min-h-[500px] lg:min-h-full">
          <svg
            viewBox="0 0 620 560"
            role="img"
            aria-labelledby="cta-visual-title cta-visual-desc"
            className="absolute inset-0 h-full w-full"
          >
            <title id="cta-visual-title">Komposisi material daur ulang</title>
            <desc id="cta-visual-desc">
              Botol plastik, kardus, kertas, daun, dan simbol daur ulang.
            </desc>
            <path
              d="M107 113C171 46 306 41 397 74C505 113 579 223 554 334C525 464 390 524 254 502C130 482 34 390 50 265C57 203 67 155 107 113Z"
              fill="#0B7544"
            />
            <circle cx="458" cy="123" r="108" fill="#22C55E" opacity=".13" />
            <circle
              cx="458"
              cy="123"
              r="74"
              fill="none"
              stroke="#86EFAC"
              strokeWidth="2"
              opacity=".24"
            />

            <g transform="translate(296 206) rotate(8)">
              <path
                d="M44 0h62l9 28-13 17 16 158c2 20-13 37-33 37H62c-20 0-35-17-33-37L45 45 34 28 44 0Z"
                fill="#DDFCE8"
              />
              <path d="M45 0h61v24H45z" fill="#86EFAC" />
              <path d="M38 83h70l7 74H31l7-74Z" fill="#4ADE80" opacity=".55" />
              <path
                d="M52 115c11-17 35-17 46 0M49 138c15 19 38 19 52 0"
                fill="none"
                stroke="#08713F"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>

            <g transform="translate(103 273) rotate(-8)">
              <path d="M0 37 100 0l92 45-98 43L0 37Z" fill="#FDE68A" />
              <path d="m0 37 94 51v116L0 149V37Z" fill="#D6A64E" />
              <path d="m94 88 98-43v111l-98 48V88Z" fill="#E9BC65" />
              <path d="m53 18 93 45" stroke="#92400E" strokeWidth="5" opacity=".35" />
              <path
                d="M28 104h42M28 120h31"
                stroke="#FFF7D1"
                strokeWidth="7"
                strokeLinecap="round"
                opacity=".75"
              />
            </g>

            <g transform="translate(338 389) rotate(-10)">
              <rect width="151" height="104" rx="8" fill="#F8FAFC" />
              <rect x="16" y="18" width="83" height="8" rx="4" fill="#86EFAC" />
              <rect x="16" y="38" width="117" height="6" rx="3" fill="#CBD5E1" />
              <rect x="16" y="54" width="100" height="6" rx="3" fill="#CBD5E1" />
              <rect x="16" y="70" width="71" height="6" rx="3" fill="#CBD5E1" />
            </g>

            <g
              fill="none"
              stroke="#BBF7D0"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".9"
            >
              <path d="M213 126c30-28 74-39 116-28" />
              <path d="m318 73 28 30-39 17" />
              <path d="M479 275c16 36 13 78-8 111" />
              <path d="m500 383-34 22-10-39" />
              <path d="M235 454c-41-7-78-30-98-65" />
              <path d="m112 400 16-40 35 24" />
            </g>

            <g fill="#4ADE80">
              <path d="M103 182c-35-5-55-29-57-70 39 5 59 28 57 70Z" />
              <path d="M104 182c6-39 28-59 67-59-5 38-27 58-67 59Z" fill="#86EFAC" />
              <path d="M525 425c-29-4-45-24-47-57 32 3 49 22 47 57Z" />
              <path d="M526 425c4-31 21-48 52-49-3 31-21 48-52 49Z" fill="#86EFAC" />
            </g>
            <path
              d="M104 181 67 137M105 181l40-37M526 424l-31-35M527 424l31-29"
              stroke="#D1FAE5"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
