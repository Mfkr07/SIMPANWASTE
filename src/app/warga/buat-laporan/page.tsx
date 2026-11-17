"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Recycle,
  Truck,
  MapPin,
  ClipboardCheck,
  Check,
  Scale,
  Building2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { PageTitle, Button } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { banks, Report } from "@/data/wargaSeedData";

export default function CreateReportPage() {
  const router = useRouter();
  const { citizenProfile, categories, minPickup, reports, setReports, notify } = useWarga();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(categories[0]?.name || "Botol Plastik PET");
  const [weight, setWeight] = useState(0);
  const [method, setMethod] = useState<"Pickup" | "Drop-off">("Drop-off");
  const [location, setLocation] = useState(banks[0].name);

  const pickupOk = weight >= minPickup;

  const next = () => {
    if (step === 1 && weight <= 0) return notify("Masukkan estimasi berat yang valid.");
    if (step === 2 && method === "Pickup" && !pickupOk) return;
    setStep(Math.min(4, step + 1));
  };

  const submit = () => {
    const todayFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const newReport: Report = {
      id: `SW-261112-${String(reports.length + 30).padStart(3, "0")}`,
      citizen: citizenProfile.name,
      phone: citizenProfile.phone,
      category,
      estimate: weight,
      method,
      status: "Menunggu",
      date: todayFormatted,
      location: method === "Pickup" ? (location || citizenProfile.address) : location,
      assigned: "Rizky Pratama",
    };

    setReports((prev) => [newReport, ...prev]);
    notify("Laporan berhasil dibuat dan diteruskan ke petugas.");
    router.push("/warga/riwayat");
  };

  const steps = [
    { label: "Informasi", icon: Recycle },
    { label: "Metode", icon: Truck },
    { label: "Lokasi", icon: MapPin },
    { label: "Konfirmasi", icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Buat Laporan Setoran"
        desc="Lengkapi informasi sampah untuk membuat laporan baru."
      />

      {/* Stepper Header */}
      <div className="relative mb-7 rounded-2xl border border-slate-200 bg-white px-3 py-5 shadow-sm sm:px-7">
        <div className="absolute left-[12.5%] right-[12.5%] top-[38px] h-0.5 bg-slate-200" />
        <div
          className="absolute left-[12.5%] top-[38px] h-0.5 bg-green-500 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 75}%` }}
        />
        <div className="relative grid grid-cols-4">
          {steps.map((item, index) => {
            const number = index + 1;
            const active = step === number;
            const complete = step > number;
            const StepIcon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border-4 border-white shadow-sm transition-all duration-300 sm:h-11 sm:w-11 ${
                    active
                      ? "bg-green-700 text-white ring-4 ring-green-100"
                      : complete
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {complete ? <Check size={17} strokeWidth={3} /> : <StepIcon size={17} />}
                </div>
                <p
                  className={`mt-2 text-[10px] font-extrabold sm:text-xs ${
                    active ? "text-green-800" : complete ? "text-green-600" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,.06)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-green-600" />
          <div className="p-6 sm:p-8">
            {/* Step 1: Info Sampah */}
            {step === 1 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Recycle size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 01
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Informasi sampah</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Pilih satu kategori utama dan masukkan estimasi beratnya.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Recycle size={16} className="text-green-700" /> Kategori sampah
                    </span>
                    <select
                      className="input bg-[#f8faf8] py-3"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <span className="mt-2 block text-xs leading-5 text-slate-400">
                      Pilih kategori yang paling sesuai dengan sampah utama Anda.
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Scale size={16} className="text-green-700" /> Estimasi berat
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        className="input bg-[#f8faf8] py-3 pr-14"
                        placeholder="Contoh: 6,5"
                        value={weight || ""}
                        onChange={(e) => setWeight(Number(e.target.value))}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        kg
                      </span>
                    </div>
                    <span className="mt-2 block text-xs leading-5 text-slate-400">
                      Timbang secara kasar jika memungkinkan. Berat final ditentukan saat penimbangan oleh petugas.
                    </span>
                  </label>

                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                    <Scale size={17} className="mt-0.5 shrink-0" />
                    <p>
                      <strong>Ketentuan:</strong> Minimum estimasi berat untuk penjemputan (Pickup) adalah{" "}
                      <strong>{minPickup} kg</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Metode Penyetoran */}
            {step === 2 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Truck size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 02
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Metode penyetoran</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pilih cara penyerahan sampah yang sesuai.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={!pickupOk}
                    onClick={() => setMethod("Pickup")}
                    className={`group rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer ${
                      method === "Pickup" && pickupOk
                        ? "border-green-600 bg-green-50 shadow-sm"
                        : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                    }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Truck size={21} />
                    </div>
                    <h3 className="mt-5 font-extrabold text-slate-900">Pickup</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Petugas menjemput sampah ke titik alamat Anda di Palembang.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("Drop-off")}
                    className={`group rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 cursor-pointer ${
                      method === "Drop-off"
                        ? "border-green-600 bg-green-50 shadow-sm"
                        : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                    }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Building2 size={21} />
                    </div>
                    <h3 className="mt-5 font-extrabold text-slate-900">Drop-off</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Antar mandiri ke bank sampah aktif (bebas batasan berat minimum).
                    </p>
                  </button>
                </div>

                {!pickupOk && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <XCircle className="shrink-0 text-amber-600" size={20} />
                    <p>
                      Layanan Pickup belum tersedia karena estimasi <strong>{weight} kg</strong> masih di bawah
                      batas minimum {minPickup} kg. Silakan pilih Drop-off atau tambah setoran Anda.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Lokasi */}
            {step === 3 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 03
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Pilih lokasi</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {method === "Pickup"
                        ? "Tentukan titik penjemputan yang mudah diakses petugas."
                        : "Pilih bank sampah tujuan setoran Anda."}
                    </p>
                  </div>
                </div>

                {method === "Pickup" ? (
                  <>
                    <div className="map-large mt-7">
                      <div className="map-road a" />
                      <div className="map-road b" />
                      <span className="map-pin left-[47%] top-[44%] absolute -translate-x-1/2 -translate-y-1/2">
                        <MapPin size={21} />
                      </span>
                    </div>
                    <label className="mt-5 block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">
                        Alamat penjemputan
                      </span>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="input bg-[#f8faf8] py-3"
                        placeholder="Masukkan alamat lengkap"
                      />
                    </label>
                  </>
                ) : (
                  <div className="mt-7 space-y-3">
                    {banks.map((b) => (
                      <button
                        type="button"
                        key={b.name}
                        onClick={() => setLocation(b.name)}
                        className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition cursor-pointer ${
                          location === b.name
                            ? "border-green-600 bg-green-50 shadow-sm"
                            : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                        }`}
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                          <MapPin size={19} />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{b.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{b.address}</p>
                          <p className="mt-2 text-xs font-semibold text-green-700">{b.hours}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Konfirmasi */}
            {step === 4 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <ClipboardCheck size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 04
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Konfirmasi laporan</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pastikan rincian laporan setoran berikut sudah benar.
                    </p>
                  </div>
                </div>

                <dl className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-[#f8faf8] px-5">
                  {[
                    ["Kategori", category],
                    ["Estimasi berat", `${weight} kg`],
                    ["Metode", method],
                    ["Lokasi tujuan", location],
                    ["Status awal", "Menunggu"],
                  ].map(([a, b]) => (
                    <div key={a} className="flex justify-between gap-5 py-4 text-sm">
                      <dt className="text-slate-500">{a}</dt>
                      <dd className="text-right font-bold text-slate-800">{b}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex gap-3 rounded-xl bg-sky-50 p-4 text-xs leading-5 text-sky-800">
                  <ShieldCheck size={17} className="shrink-0 text-sky-700 mt-0.5" />
                  <span>
                    Nilai rupiah aktual akan dihitung otomatis oleh sistem berdasarkan berat nyata, kebersihan sampah, dan tarif master yang berlaku saat penimbangan.
                  </span>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Button
                variant="secondary"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="cursor-pointer"
              >
                <ArrowLeft size={17} />
                <span>Kembali</span>
              </Button>

              {step < 4 ? (
                <Button onClick={next} className="cursor-pointer">
                  <span>Lanjutkan</span>
                  <ArrowRight size={17} />
                </Button>
              ) : (
                <Button onClick={submit} className="cursor-pointer">
                  <Check size={17} />
                  <span>Kirim Laporan Setoran</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Aside Summary Card */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Ringkasan Laporan</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Warga:</span>
              <span className="font-bold text-slate-900">{citizenProfile.name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kategori:</span>
              <span className="font-bold text-slate-900">{category}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimasi Berat:</span>
              <span className="font-bold text-slate-900">{weight > 0 ? `${weight} kg` : "—"}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Metode:</span>
              <span className="font-bold text-slate-900">{method}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 leading-relaxed">
            Laporan yang dikirim akan berstatus <strong className="text-amber-700">Menunggu</strong> hingga diperiksa dan ditimbang oleh petugas bank sampah.
          </div>
        </div>
      </div>
    </div>
  );
}

