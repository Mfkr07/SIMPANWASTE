"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  LogOut,
  User,
  Shield,
  BarChart3,
  Database,
  Truck,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";

export default function AdminDashboardPage() {
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
      <header className="bg-[#153626] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base">
                SIMPANWASTE
              </span>
              <span className="ml-2 text-[10px] font-bold text-emerald-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full uppercase">
                Panel Administrator
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-200 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white">
                {user?.nama || "Admin Palembang"}
              </span>
              <span className="text-gray-400">(@{user?.username || "admin"})</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/50 border border-rose-500/30 px-3 py-1.5 rounded-xl transition"
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
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-[#1E7E48] border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hak Akses Super Admin Terverifikasi (Fase 1 Selesai)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Pusat Kendali Sistem & Data Master
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Selamat datang, {user?.nama || "Administrator"}. Anda memiliki otoritas penuh
            untuk mengelola master kategori & harga sampah, batas pickup, akun petugas, serta memantau analitik agregat.
          </p>
        </div>

        {/* Administration Modules Grid */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Modul Pengelolaan Admin
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E7E48] flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Data Master Sampah
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Katalog 5 kategori sampah terkonfirmasi x 3 matriks kondisi harga (Bersih, Kotor, Tercampur Air).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Fase 2
              </span>
              <span>CRUD Master Data</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Kelola Akun Petugas
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Pembuatan dan penonaktifan akun staf penimbangan di lapangan via Route Handler Service Role.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md">
                Fase 2
              </span>
              <span>AUTH-04</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Mitra & Distribusi
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Pencatatan penyaluran sampah terpilah ke pabrik daur ulang dan mitra pengepul resmi Palembang.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-md">
                Fase 2
              </span>
              <span>Mitra Pengepul</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Dashboard Analitik
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Visualisasi tren berat sampah, nilai saldo terdistribusi, dan komposisi kategori anorganik.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md">
                Fase 7
              </span>
              <span>Recharts</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

