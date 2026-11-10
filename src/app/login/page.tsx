"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Leaf,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type RoleType = "warga" | "petugas" | "admin";

interface DemoPreset {
  username: string;
  role: RoleType;
  label: string;
}

const DEMO_PRESETS: Record<RoleType, DemoPreset> = {
  warga: {
    username: "ayu.lestari",
    role: "warga",
    label: "Warga (Ayu Lestari)",
  },
  petugas: {
    username: "petugas.burlian",
    role: "petugas",
    label: "Petugas Lapangan",
  },
  admin: {
    username: "admin.palembang",
    role: "admin",
    label: "Administrator Sistem",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const registered = searchParams.get("registered");

  const [role, setRole] = useState<RoleType>("warga");
  const [username, setUsername] = useState("ayu.lestari");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    registered ? "Akun warga berhasil dibuat! Silakan masuk dengan kredensial Anda." : null
  );

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    setErrorMessage(null);
    setUsername(DEMO_PRESETS[newRole].username);
    setPassword("Password123!");
  };

  const handleFillDemo = (targetRole: RoleType) => {
    handleRoleChange(targetRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Silakan lengkapi username dan password Anda.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
          peran: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal masuk ke akun. Silakan periksa kredensial Anda.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Login berhasil! Mengalihkan ke dashboard...");

      // Tentukan rute redirect
      const targetDestination = redirectUrl || data.redirectUrl || `/${role}/dashboard`;
      setTimeout(() => {
        router.push(targetDestination);
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMessage("Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main Split Authentication Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-gray-100">
        {/* Left Panel: Institutional Brand & Statistics (5 cols) */}
        <div className="lg:col-span-5 bg-[#153626] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-tight text-white">
                  SIMPANWASTE
                </span>
                <span className="text-[10px] tracking-widest text-emerald-300 font-semibold uppercase">
                  KOTA PALEMBANG
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Narrative Content */}
          <div className="my-8 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-1 text-xs text-emerald-200 mb-5 font-medium backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Sistem pengelolaan sampah terpadu</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Pilah hari ini,<br />
              hijaukan masa depan.
            </h2>

            <p className="text-sm text-gray-200 mt-4 leading-relaxed">
              Kelola setoran sampah anorganik, pantau tabungan, dan terhubung dengan bank
              sampah terverifikasi dalam satu layanan.
            </p>

            {/* 3 Glassmorphism Impact Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5 mt-8">
              <div className="bg-white/10 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex flex-col justify-center">
                <p className="text-base sm:text-lg font-bold text-white leading-tight">
                  12,8 ton
                </p>
                <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">
                  Sampah terkelola
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex flex-col justify-center">
                <p className="text-base sm:text-lg font-bold text-white leading-tight">
                  1.240+
                </p>
                <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">
                  Setoran warga
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex flex-col justify-center">
                <p className="text-base sm:text-lg font-bold text-white leading-tight">
                  8
                </p>
                <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">
                  Bank sampah
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-[11px] text-gray-400">
              Data pada prototipe ini merupakan data demonstrasi.
            </p>
          </div>
        </div>

        {/* Right Panel: Role Selector & Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div>
            <span className="text-xs font-bold text-[#1E7E48] uppercase tracking-wider">
              Selamat datang kembali
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Masuk ke akun Anda
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Pilih peran demo lalu masukkan data untuk menjelajahi SIMPANWASTE.
            </p>
          </div>

          {/* Segmented Role Tabs (AUTH-02) */}
          <div className="grid grid-cols-3 bg-gray-100 p-1.5 rounded-2xl my-6 border border-gray-200/60">
            {(["warga", "petugas", "admin"] as RoleType[]).map((tabRole) => (
              <button
                key={tabRole}
                type="button"
                onClick={() => handleRoleChange(tabRole)}
                className={`py-2.5 text-sm font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                  role === tabRole
                    ? "bg-white text-[#1E7E48] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tabRole}
              </button>
            ))}
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#1E7E48] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ayu.lestari"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48] transition bg-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48] transition bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E7E48] hover:bg-[#18663A] text-white font-semibold py-3.5 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#1E7E48]/20 disabled:opacity-60 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke SIMPANWASTE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick-Fill Helper Box */}
          <div className="mt-6 bg-[#EAF6EE] border border-[#C6E6D1] rounded-2xl p-4 text-xs text-[#153626] shadow-xs">
            <div className="flex items-start gap-2.5 mb-2.5">
              <Info className="w-4 h-4 text-[#1E7E48] shrink-0 mt-0.5" />
              <p className="leading-snug font-medium">
                Akun demo: Anda dapat masuk menggunakan data yang sudah terisi untuk setiap peran.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 border-t border-[#C6E6D1]/60">
              {(["warga", "petugas", "admin"] as RoleType[]).map((tabRole) => (
                <button
                  key={tabRole}
                  type="button"
                  onClick={() => handleFillDemo(tabRole)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer ${
                    role === tabRole
                      ? "bg-[#1E7E48] text-white border-[#1E7E48]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Isi {DEMO_PRESETS[tabRole].label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Switch to Register Link */}
          <div className="mt-6 pt-4 text-center border-t border-gray-100 text-sm text-gray-600">
            <span>Belum punya akun warga? </span>
            <Link
              href="/register"
              className="text-[#1E7E48] font-bold hover:underline transition"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E7E48]" />
            <p className="text-xs text-gray-500 font-medium">Memuat halaman login...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
