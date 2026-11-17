"use client";

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Leaf,
  Eye,
  CheckCircle2,
  Recycle,
  Users,
  Building2,
  BookOpen,
  FileText,
} from "lucide-react";

export default function AboutUsPage() {
  const openCooperationAlert = () => {
    alert("Kontak kerja sama belum tersedia. Silakan lengkapi data kontak.");
  };

  const openWhatsAppAlert = () => {
    alert("Nomor WhatsApp utama belum tersedia.");
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">
      <Navbar activePath="/about-us" />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#eaf6ed] px-5 py-16 sm:py-24 lg:px-8">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[56px] border-green-600/[.06] pointer-events-none" />
          <div className="relative mx-auto flex max-w-7xl items-center gap-6">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-700 text-white shadow-lg">
              <Leaf size={26} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-green-700">
                ABOUT US
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-5xl">
                Gerakan lokal untuk pengelolaan sampah yang lebih terstruktur.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Bank Sampah Graha Pena merupakan inisiatif di Palembang yang mendorong pemilahan, pencatatan setoran, dan kolaborasi lintas komunitas.
              </p>
            </div>
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="px-5 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Eye size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Visi</h2>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  Mendorong kebiasaan memilah dan pengelolaan sampah anorganik yang memberi manfaat bagi masyarakat dan lingkungan.
                </p>
              </section>

              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <CheckCircle2 size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Misi</h2>
                </div>
                <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  <li>1. Memperluas edukasi pemilahan dari sumber.</li>
                  <li>2. Menyelenggarakan pencatatan setoran yang transparan.</li>
                  <li>3. Mengembangkan kemitraan sekolah, komunitas, dan instansi.</li>
                  <li>4. Mendukung distribusi material daur ulang yang lebih tertata.</li>
                </ol>
              </section>
            </div>

            {/* Layanan Kerja Sama */}
            <section className="mt-12">
              <h2 className="text-2xl font-extrabold text-slate-900">Layanan Kerja Sama</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Produk Daur Ulang", icon: Recycle },
                  { title: "Narasumber & Fasilitator", icon: Users },
                  { title: "CSR / TJSL", icon: Building2 },
                  { title: "Pendampingan Unit & Sekolah", icon: BookOpen },
                ].map(({ title, icon: ServiceIcon }) => (
                  <div key={title} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <ServiceIcon className="text-green-700" size={21} />
                    <h3 className="mt-5 font-extrabold text-slate-900">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Detail layanan menunggu informasi terverifikasi.
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCooperationAlert}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800 transition active:scale-[.98]"
                >
                  Ajukan Kerja Sama
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-60"
                >
                  Company Profile belum tersedia
                </button>
              </div>
            </section>

            {/* Pengurus & Regulasi */}
            <section className="mt-12 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Users size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Pengurus</h2>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  Nama, jabatan, dan foto pengurus terverifikasi belum tersedia.
                </p>
              </section>

              <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
                    <FileText size={19} />
                  </div>
                  <h2 className="font-extrabold text-slate-900">Regulasi</h2>
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    "Regulasi pengelolaan sampah",
                    "Kebijakan bank sampah",
                    "Pedoman operasional",
                  ].map((item) => (
                    <details key={item} className="rounded-xl bg-slate-50 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-bold text-slate-800">{item}</summary>
                      <p className="mt-2 text-xs text-slate-500">
                        Dokumen terverifikasi belum tersedia.
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </section>

            {/* FAQ Accordion */}
            <section className="mt-12">
              <h2 className="text-2xl font-extrabold text-slate-900">FAQ</h2>
              <div className="mt-5 space-y-3">
                {[
                  [
                    "Apakah harus menjadi anggota terlebih dahulu?",
                    "Ya, data diri diperlukan agar setoran dan saldo tercatat pada akun yang tepat.",
                  ],
                  [
                    "Berapa minimal setoran?",
                    "Tidak ada minimum Drop-off pada prototipe. Minimum pickup demo adalah 5 kg.",
                  ],
                  [
                    "Kapan saldo bisa dicairkan?",
                    "Permintaan penarikan dicatat melalui sistem dan diproses manual oleh petugas.",
                  ],
                  [
                    "Bisakah sekolah atau kantor menjadi mitra?",
                    "Kategori sekolah, komunitas, perusahaan, dan instansi termasuk dalam usulan nasabah/mitra.",
                  ],
                  [
                    "Apakah ada layanan jemput?",
                    "Pickup tersedia jika estimasi berat memenuhi batas minimum; area jangkauan belum terverifikasi.",
                  ],
                ].map(([question, answer]) => (
                  <details
                    key={question}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <summary className="cursor-pointer font-bold text-slate-900">{question}</summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Banner Hijau Siap Menabung Sampah */}
            <section className="mt-12 rounded-[2rem] bg-green-800 p-8 text-white sm:p-12 shadow-xl">
              <h2 className="text-3xl font-extrabold">Siap menabung sampah?</h2>
              <p className="mt-3 text-green-100">Mulai pilah dari rumah dan setor ke Graha Pena.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openWhatsAppAlert}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-extrabold text-green-900 shadow-sm hover:bg-green-50 transition active:scale-[.98]"
                >
                  WhatsApp
                </button>
                <Link
                  href="/alur-penyetoran"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition active:scale-[.98]"
                >
                  Petunjuk Arah
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
