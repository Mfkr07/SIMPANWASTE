"use client";

import { Scale, ClipboardCheck, Building2 } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      value: "12,8 ton",
      label: "Total sampah terkumpul",
      icon: Scale,
    },
    {
      value: "1.240+",
      label: "Jumlah setoran warga",
      icon: ClipboardCheck,
    },
    {
      value: "8 lokasi",
      label: "Bank sampah aktif",
      icon: Building2,
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
              Gambaran sistem
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Dampak yang dapat dipantau
            </h2>
          </div>
          <p className="text-xs font-medium text-amber-700">
            Statistik berikut merupakan data demonstrasi.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              data-reveal
              className="reveal-card rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-100 text-green-700">
                <Icon size={21} />
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
                {value}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
