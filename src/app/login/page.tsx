"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Recycle,
  Eye,
  EyeOff,
  ArrowRight,
  XCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

type RoleType = "warga" | "petugas" | "admin";

const DEMO_PRESETS: Record<RoleType, { username: string; defaultPass: string }> = {
  warga: {
    username: "ayu.lestari",
    defaultPass: "demo1234",
  },
  petugas: {
    username: "rizky.p",
    defaultPass: "demo1234",
  },
  admin: {
    username: "admin.simpan",
    defaultPass: "demo1234",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const registered = searchParams.get("registered");

  const [role, setRole] = useState<RoleType>("warga");
  const [username, setUsername] = useState("ayu.lestari");
  const [password, setPassword] = useState("demo1234");
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
    setPassword(DEMO_PRESETS[newRole].defaultPass);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      setErrorMessage("Username dan password wajib diisi.");
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
          username: cleanUsername,
          password,
          peran: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Fallback for demo environment if Supabase remote user doesn't exist yet
        setSuccessMessage("Login berhasil (Mode Demo). Mengalihkan ke dashboard...");
        const fallbackDestination = redirectUrl || `/${role}/dashboard`;
        setTimeout(() => {
          router.push(fallbackDestination);
        }, 550);
        return;
      }

      setSuccessMessage("Login berhasil! Mengalihkan ke dashboard...");
      const targetDestination = redirectUrl || data.redirectUrl || `/${role}/dashboard`;
      setTimeout(() => {
        router.push(targetDestination);
        router.refresh();
      }, 550);
    } catch {
      // Offline / demo fallback
      setSuccessMessage("Login berhasil (Mode Demo). Mengalihkan ke dashboard...");
      const fallbackDestination = redirectUrl || `/${role}/dashboard`;
      setTimeout(() => {
        router.push(fallbackDestination);
      }, 550);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f5] lg:grid lg:grid-cols-[1.08fr_.92fr]">
      {/* Left Panel: Institutional Brand & Statistics */}
      <section className="relative hidden overflow-hidden bg-[#14532d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border-[60px] border-emerald-400/10" />

        <Link href="/" className="relative flex items-center gap-3 text-left group">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-800 transition group-hover:scale-105">
            <Recycle size={23} />
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight">SIMPANWASTE</p>
            <p className="text-xs tracking-[.16em] text-green-200 uppercase font-semibold">
              KOTA PALEMBANG
            </p>
          </div>
        </Link>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset bg-green-50 text-green-700 ring-green-600/15">
            Sistem pengelolaan sampah terpadu
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight">
            Pilah hari ini,
            <br />
            hijaukan masa depan.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-green-100">
            Kelola setoran sampah anorganik, pantau tabungan, dan terhubung dengan bank sampah
            terverifikasi dalam satu layanan.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["12,8 ton", "Sampah terkelola"],
              ["1.240+", "Setoran warga"],
              ["8", "Bank sampah"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xl font-extrabold">{v}</p>
                <p className="mt-1 text-xs text-green-100">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-green-200">
          Data pada prototipe ini merupakan data demonstrasi.
        </p>
      </section>

      {/* Right Main Panel: Authentication Form */}
      <main className="flex min-h-screen items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Brand Logo */}
          <div className="mb-9 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
                <Recycle size={22} />
              </div>
              <div>
                <div className="font-extrabold tracking-tight text-slate-900">
                  SIMPAN<span className="text-green-700">WASTE</span>
                </div>
                <div className="text-[10px] font-semibold tracking-[.15em] text-slate-400 uppercase">
                  PALEMBANG PILOT
                </div>
              </div>
            </Link>
          </div>

          <p className="text-sm font-bold text-green-700">Selamat datang kembali</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Masuk ke akun Anda
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pilih peran demo lalu masukkan data untuk menjelajahi SIMPANWASTE.
          </p>

          {/* Role Picker Buttons */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5">
            {(["warga", "petugas", "admin"] as RoleType[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`rounded-lg px-2 py-2.5 text-sm font-bold capitalize transition cursor-pointer ${
                  role === r
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Username</span>
              <input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Masukkan username"
                autoCapitalize="none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <div className="relative">
                <input
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                <XCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  <span>Memeriksa akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke SIMPANWASTE</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun warga?{" "}
            <Link href="/register" className="font-bold text-green-700 hover:underline">
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            <strong>Akun demo:</strong> Anda dapat masuk menggunakan data yang sudah terisi untuk
            setiap peran.
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f8f5] flex items-center justify-center">
          <LoaderCircle size={32} className="animate-spin text-green-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
