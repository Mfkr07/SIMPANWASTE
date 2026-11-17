"use client";

import { useState } from "react";
import { MapPin, Clock3, CalendarDays, ArrowRight } from "lucide-react";

export const grahaPenaLocation = {
  name: "Bank Sampah Graha Pena Palembang",
  shortName: "Bank Sampah Graha Pena",
  address:
    "Jl. Kolonel H. Barlian KM.6,5 No.773, Srijaya, Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan 30961",
  landmark: "Bersebelahan dengan Taman Wisata Punti Kayu.",
  weekdaySchedule: "09.00–16.00 WIB",
  saturdaySchedule: "Kegiatan rutin pemilahan sampah",
};

export const banks = [
  {
    name: "Bank Sampah Sejahtera",
    address: "Jl. Merdeka No. 24, Bukit Kecil",
    hours: "Sen–Sab, 08.00–15.00",
  },
  {
    name: "Bank Sampah Melati",
    address: "Jl. Demang Lebar Daun, Ilir Barat I",
    hours: "Sel–Min, 07.30–14.00",
  },
  {
    name: "Bank Sampah Kalidoni Hijau",
    address: "Jl. Mayor Zen No. 18, Kalidoni",
    hours: "Sen–Jum, 08.00–16.00",
  },
];

export default function MapsPreviewSection() {
  const [selectedLandingLocation, setSelectedLandingLocation] = useState("graha-pena");

  const landingLocations = [
    {
      id: "graha-pena",
      name: grahaPenaLocation.name,
      address: grahaPenaLocation.address,
      hours: `Senin–Jumat: ${grahaPenaLocation.weekdaySchedule}`,
      saturday: `Sabtu: ${grahaPenaLocation.saturdaySchedule}`,
      landmark: grahaPenaLocation.landmark,
      partner: true,
    },
    ...banks.map((bank, index) => ({
      ...bank,
      id: `referensi-${index}`,
      address: `${bank.address}, Palembang, Sumatera Selatan`,
      saturday: "",
      landmark: "",
      partner: false,
    })),
  ];

  const activeLandingLocation =
    landingLocations.find((location) => location.id === selectedLandingLocation) ||
    landingLocations[0];

  const activeLandingAddress = encodeURIComponent(activeLandingLocation.address);

  return (
    <section id="lokasi" className="scroll-mt-20 bg-[#f3f8f3] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
            Maps Bank Sampah
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Temukan lokasi penyetoran di Palembang
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Graha Pena merupakan mitra kerja sama utama SIMPANWASTE. Lokasi lainnya tetap
            ditampilkan sebagai referensi bank sampah berdasarkan data demonstrasi aplikasi.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
          {/* Kolom Kiri: Daftar Card Lokasi */}
          <div data-reveal className="reveal-card">
            <div className="space-y-3">
              {landingLocations.map((location) => {
                const isSelected = location.id === activeLandingLocation.id;
                return (
                  <article
                    key={location.id}
                    className={`transition-all duration-200 ${
                      location.partner
                        ? "rounded-2xl border-2 border-green-600 bg-green-50 p-5 shadow-[0_10px_30px_rgba(22,101,52,.09)]"
                        : "rounded-2xl border border-slate-200 bg-white p-4"
                    } ${isSelected && !location.partner ? "ring-2 ring-green-600 shadow-md" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`grid shrink-0 place-items-center rounded-xl ${
                          location.partner
                            ? "h-11 w-11 bg-green-800 text-white"
                            : "h-10 w-10 bg-green-50 text-green-600"
                        }`}
                      >
                        <MapPin size={location.partner ? 21 : 18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {location.name}
                          </h3>
                          {location.partner && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/15">
                              Mitra SIMPANWASTE
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {location.address}
                        </p>
                        {location.landmark && (
                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {location.landmark}
                          </p>
                        )}
                        <div className="mt-3 space-y-1.5 text-xs font-bold text-green-700">
                          <p className="flex items-start gap-1.5">
                            <Clock3 className="mt-0.5 shrink-0" size={13} /> {location.hours}
                          </p>
                          {location.saturday && (
                            <p className="flex items-start gap-1.5">
                              <CalendarDays className="mt-0.5 shrink-0" size={13} />{" "}
                              {location.saturday}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedLandingLocation(location.id)}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-green-700 transition hover:text-green-900"
                        >
                          Lihat Detail <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Peta Interaktif & Floating Overlays */}
          <div
            data-reveal
            className="reveal-card self-start rounded-[2rem] border border-white bg-white p-3 shadow-xl lg:sticky lg:top-24"
          >
            <div className="relative overflow-hidden rounded-[1.4rem] bg-slate-100">
              <iframe
                key={activeLandingLocation.id}
                title={`Peta ${activeLandingLocation.name}`}
                src={`https://www.google.com/maps?q=${activeLandingAddress}&z=15&output=embed`}
                className="h-[580px] w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              {/* Floating Pills Selector di Bagian Atas Peta */}
              <div
                className="absolute left-4 right-4 top-4 flex flex-wrap gap-2"
                aria-label="Pilih lokasi bank sampah"
              >
                {landingLocations.map((location) => {
                  const active = location.id === activeLandingLocation.id;
                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => setSelectedLandingLocation(location.id)}
                      aria-label={`Pusatkan peta ke ${location.name}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold shadow-md backdrop-blur transition ${
                        location.partner
                          ? `border-green-900 bg-green-800 text-white ring-4 ring-green-300/50 ${
                              active ? "scale-105" : ""
                            }`
                          : `border-green-100 bg-green-50/95 text-green-700 ${
                              active ? "ring-2 ring-green-400" : "hover:bg-white"
                            }`
                      }`}
                    >
                      <MapPin size={location.partner ? 17 : 14} />
                      <span className="hidden sm:inline">
                        {location.partner
                          ? "Graha Pena"
                          : location.name.replace("Bank Sampah ", "")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Floating Detail Card di Bagian Bawah Peta */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-[.12em] ${
                        activeLandingLocation.partner ? "text-green-700" : "text-slate-500"
                      }`}
                    >
                      {activeLandingLocation.partner
                        ? "Mitra Kerja Sama SIMPANWASTE"
                        : "Lokasi Bank Sampah Lainnya"}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-slate-900">
                      {activeLandingLocation.name}
                    </p>
                    <p className="mt-1 max-w-lg text-[11px] leading-5 text-slate-500">
                      {activeLandingLocation.address}
                    </p>
                    <p className="mt-1 max-w-lg text-[11px] font-semibold leading-5 text-slate-600">
                      {activeLandingLocation.hours}
                      {activeLandingLocation.saturday
                        ? ` · ${activeLandingLocation.saturday}`
                        : ""}
                    </p>
                    {activeLandingLocation.landmark && (
                      <p className="mt-1 max-w-lg text-[11px] leading-5 text-slate-500">
                        {activeLandingLocation.landmark}
                      </p>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activeLandingAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-green-800"
                  >
                    Buka Maps <ArrowRight size={14} />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-green-800 ring-2 ring-green-200" />
                    Mitra SIMPANWASTE
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-green-300" />
                    Lokasi Bank Sampah Lainnya
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
