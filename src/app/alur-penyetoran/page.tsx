"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { grahaPenaLocation } from "@/components/landing/MapsPreviewSection";
import {
  Recycle,
  UserRound,
  Truck,
  Scale,
  WalletCards,
  CalendarDays,
  MapPin,
  ArrowRight,
  Leaf,
} from "lucide-react";

export default function AlurPenyetoranPage() {
  const encodedGrahaAddress = encodeURIComponent(grahaPenaLocation.address);

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">
      <Navbar activePath="/alur-penyetoran" />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#eaf6ed] px-5 py-16 sm:py-24 lg:px-8">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[56px] border-green-600/[.06] pointer-events-none" />
          <div className="relative mx-auto flex max-w-7xl items-center gap-6">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-700 text-white shadow-lg">
              <Recycle size={26} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-green-700">
                ALUR PENYETORAN
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-5xl">
                Dari rumah hingga menjadi tabungan.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Ikuti tahapan sederhana untuk memilah, menyetor, menimbang, dan mencatat nilai sampah di Bank Sampah Graha Pena Palembang.
              </p>
            </div>
          </div>
        </section>

        {/* 5 Tahapan Alur */}
        <section className="px-5 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-5">
              {[
                { number: "01", title: "Daftar Nasabah", desc: "Lengkapi data diri sebagai nasabah.", icon: UserRound },
                { number: "02", title: "Pilah di Rumah", desc: "Pisahkan sampah bersih dan kering.", icon: Recycle },
                { number: "03", title: "Antar atau Jemput", desc: "Drop-off ke Graha Pena atau ajukan pickup.", icon: Truck },
                { number: "04", title: "Ditimbang", desc: "Petugas memverifikasi dan menimbang manual.", icon: Scale },
                { number: "05", title: "Saldo Masuk", desc: "Nilai setoran tercatat sebagai saldo.", icon: WalletCards },
              ].map(({ number, title, desc, icon: Icon }) => (
                <div key={number} className="relative rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-green-700">{number}</span>
                    <Icon size={20} className="text-green-700" />
                  </div>
                  <h3 className="mt-5 font-extrabold text-slate-900">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>

            {/* Syarat & Cara Memilah */}
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <UserRound size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Syarat Menjadi Nasabah</h2>
                </div>
                <div className="mt-5">
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    <li>• Data diri atau identitas yang dapat diverifikasi.</li>
                    <li>• Kategori nasabah: pribadi, sekolah, komunitas, perusahaan, atau instansi.</li>
                    <li>• Informasi biaya pendaftaran belum tersedia.</li>
                  </ul>
                </div>
              </section>

              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Recycle size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Cara Memilah</h2>
                </div>
                <div className="mt-5">
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    <li>• Sampah wajib bersih, kering, dan tidak mengandung sisa cairan.</li>
                    <li>• Pisahkan material per jenis sebelum diserahkan.</li>
                    <li>• Ketentuan pelepasan label belum tersedia dalam data operasional.</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Jenis Sampah & Harga Demonstrasi */}
            <section className="mt-12">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[.14em] text-green-700">
                    Data Demonstrasi
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Jenis Sampah & Harga</h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                  Bukan harga operasional terkonfirmasi
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { group: "Kertas", info: "Kardus Rp2.800/kg · Kertas campur Rp2.200/kg" },
                  { group: "Plastik", info: "PET Rp4.500/kg · Plastik campur Rp1.800/kg" },
                  { group: "Logam", info: "Kaleng aluminium Rp12.000/kg" },
                  { group: "Kaca", info: "Harga terverifikasi belum tersedia" },
                  { group: "Lainnya", info: "Minyak jelantah: data belum tersedia" },
                ].map(({ group, info }) => (
                  <div key={group} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-extrabold text-green-800">{group}</h3>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{info}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
                <h3 className="text-sm font-extrabold text-red-800">Tidak diterima</h3>
                <p className="mt-2 text-sm leading-6 text-red-700">
                  Sampah B3, medis, material berukuran besar, dan layanan pengumpulan sampah organik.
                </p>
              </div>
            </section>

            {/* Ketentuan Tambahan */}
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <WalletCards size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Minimal & Saldo</h2>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Minimum pickup demo: 5 kg. Saldo dapat dilihat setelah login dan penarikan diproses manual oleh petugas.
                </p>
              </section>

              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Truck size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Layanan Jemput</h2>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Batas minimum mengikuti konfigurasi sistem. Area jangkauan terverifikasi belum tersedia.
                </p>
              </section>

              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <CalendarDays size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Jadwal Setor</h2>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Senin–Jumat {grahaPenaLocation.weekdaySchedule}. Sabtu: {grahaPenaLocation.saturdaySchedule}.
                </p>
              </section>
            </div>
          </div>
        </section>

        {/* Lokasi & Maps Operasional */}
        <section className="bg-white px-5 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-green-700">
                Lokasi & Maps
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-950">Lokasi operasional</h2>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  title="Peta Sekretariat Graha Pena"
                  src={`https://www.google.com/maps?q=${encodedGrahaAddress}&z=16&output=embed`}
                  className="h-[480px] w-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-[#f7faf8] p-5">
                  <MapPin className="text-green-700" size={21} />
                  <h3 className="mt-4 font-extrabold text-slate-900">Sekretariat Graha Pena</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{grahaPenaLocation.address}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-600">Lokasi penyetoran yang terintegrasi dengan SIMPANWASTE.</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodedGrahaAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-green-700 hover:text-green-800"
                  >
                    Petunjuk Arah <ArrowRight size={14} />
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-[#f7faf8] p-5">
                  <MapPin className="text-green-700" size={21} />
                  <h3 className="mt-4 font-extrabold text-slate-900">Gudang Talang Betutu</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Alamat dan titik peta terverifikasi belum tersedia.</p>
                  <p className="mt-3 text-xs leading-5 text-slate-600">Disebut berada di belakang bandara lama; fungsi lokasi menunggu konfirmasi.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
