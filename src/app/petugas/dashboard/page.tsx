"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  LogOut,
  User,
  ClipboardCheck,
  Scale,
  Banknote,
  Tags,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function PetugasDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
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
      {/* Top Header */}
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
              <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                Area Petugas
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-gray-900">
                {user?.nama || "Petugas Lapangan"}
              </span>
              <span className="text-gray-400">(@{user?.username || "petugas"})</span>
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hak Akses Petugas Terverifikasi (Fase 1 Aktif)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Panel Kerja Petugas Lapangan
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Selamat datang, {user?.nama || "Petugas"}. Anda memiliki kewenangan untuk
            memverifikasi kebersihan sampah, menimbang berat aktual, dan memproses ajuan penarikan saldo.
          </p>
        </div>

        {/* Action Modules Grid */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Tugas & Tanggung Jawab Petugas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E7E48] flex items-center justify-center mb-4">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Daftar Tugas Setoran
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Menampilkan antrean laporan pickup dan drop-off dari warga Kota Palembang yang
                siap dijemput dan ditimbang.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Fase 4
              </span>
              <span>Endpoint /api/laporan</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Form Penimbangan & Kondisi
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Input berat aktual dan pilih 3 kondisi (Bersih, Kotor, Tercampur Air) dengan
                perhitungan otomatis snapshot harga.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md">
                Fase 5
              </span>
              <span>RPC proses_penimbangan</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Antrean Penarikan Saldo
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Verifikasi dan selesaikan pencairan uang tunai tabungan warga atau pemotongan
                iuran sampah bulanan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md">
                Fase 6
              </span>
              <span>RPC proses_penarikan</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

