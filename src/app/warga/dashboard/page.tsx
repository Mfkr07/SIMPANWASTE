"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  LogOut,
  User,
  Wallet,
  PlusCircle,
  MapPin,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function WargaDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E7E48] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-gray-900 tracking-tight text-base">
                SIMPANWASTE
              </span>
              <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                Area Warga
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-[#1E7E48]" />
              <span className="font-semibold text-gray-900">
                {user?.nama || "Warga Palembang"}
              </span>
              <span className="text-gray-400">(@{user?.username || "warga"})</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm relative overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EAF6EE] text-[#1E7E48] text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Status Akun: Terverifikasi (Fase 1 Aktif)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Selamat Datang, {user?.nama || "Warga SIMPANWASTE"}!
              </h1>
              <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                Akun Anda telah berhasil diautentikasi melalui Supabase Auth. Di bawah ini
                adalah ikhtisar fitur warga yang disiapkan sesuai roadmap PRD.md.
              </p>
            </div>

            <div className="bg-[#153626] text-white p-5 rounded-2xl flex flex-col justify-between min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span>Saldo Tabungan</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold mt-2">Rp 0</p>
              <p className="text-[10px] text-gray-300 mt-1">
                PIN 6 Angka telah terkonfigurasi aman
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (Fase 2-6 Preview) */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Modul Layanan Warga
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Pelaporan Setoran */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#1E7E48] flex items-center justify-center mb-4">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Lapor Setoran Sampah
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Pilih metode Pickup (min. 5 kg) atau Drop-off ke Bank Sampah terdekat dengan
                pilihan kategori anorganik terpilah.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Fase 4
              </span>
              <span>Siap Diintegrasikan</span>
            </div>
          </div>

          {/* Card 2: Riwayat & Saldo */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Riwayat & Tabungan
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Pantau berat aktual yang diverifikasi petugas dan catatan konversi Rupiah
                yang dilindungi otentikasi PIN 6 angka.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Fase 5
              </span>
              <span>Proteksi PIN Server-Side</span>
            </div>
          </div>

          {/* Card 3: Maps Bank Sampah */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Maps Bank Sampah Interaktif
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Eksplorasi titik bank sampah aktif di Palembang, jam kerja, rute jalan, dan
                kontak pengelola langsung.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md">
                Fase 3
              </span>
              <span>Peta Leaflet</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

