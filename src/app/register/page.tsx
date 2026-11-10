"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  User,
  AtSign,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { registerStep1Schema, registerStep2Schema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();

  // Step state (1 or 2)
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Step 1 Validation & Next
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const validation = registerStep1Schema.safeParse({
      nama: nama.trim(),
      username: username.trim().toLowerCase(),
      no_hp: noHp.trim(),
      alamat: alamat.trim(),
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    // Step 1 is valid, proceed to Step 2
    setStep(2);
  };

  // Handle Step 2 Final Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const validationStep2 = registerStep2Schema.safeParse({
      password,
      confirmPassword,
      pin: pin.trim(),
    });

    if (!validationStep2.success) {
      const errors: Record<string, string> = {};
      validationStep2.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama: nama.trim(),
        username: username.trim().toLowerCase(),
        no_hp: noHp.trim(),
        alamat: alamat.trim(),
        password,
        pin: pin.trim(),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.error || "Gagal mendaftarkan akun warga.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Registrasi berhasil! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } catch (err: any) {
      setGeneralError("Terjadi kesalahan koneksi server. Silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main Split Authentication Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-gray-100">
        {/* Left Panel: Brand & Stepper Progress (5 cols) */}
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
                  PALEMBANG PILOT
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Narrative Content & Stepper Cards */}
          <div className="my-8 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-1 text-xs text-emerald-200 mb-4 font-semibold uppercase tracking-wider backdrop-blur-sm">
              <span>REGISTRASI WARGA</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Mulai perjalananmu<br />
              menuju lingkungan<br />
              yang lebih bersih.
            </h2>

            <p className="text-sm text-gray-200 mt-3 leading-relaxed">
              Buat akun dan bergabung bersama gerakan pemilahan sampah melalui SIMPANWASTE.
            </p>

            {/* Stepper Cards Indicator */}
            <div className="space-y-3 mt-8">
              {/* Step 1 Card */}
              <div
                onClick={() => {
                  if (step === 2) setStep(1);
                }}
                className={`rounded-2xl p-4 flex items-start gap-3.5 transition-all ${
                  step === 1
                    ? "bg-white/15 border border-white/25 shadow-sm"
                    : "bg-white/10 border border-white/20 hover:bg-white/15 cursor-pointer"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    step === 2
                      ? "bg-[#1E7E48] text-white shadow-sm"
                      : "bg-white text-[#153626]"
                  }`}
                >
                  {step === 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : "01"}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold tracking-wider uppercase ${
                      step === 1 ? "text-emerald-200" : "text-emerald-300"
                    }`}
                  >
                    STEP 01 — DATA DIRI
                  </p>
                  <p
                    className={`text-xs mt-0.5 leading-snug ${
                      step === 1 ? "text-white" : "text-gray-300"
                    }`}
                  >
                    Lengkapi informasi pribadi untuk membuat akun.
                  </p>
                </div>
              </div>

              {/* Step 2 Card */}
              <div
                className={`rounded-2xl p-4 flex items-start gap-3.5 transition-all ${
                  step === 2
                    ? "bg-white/15 border border-white/25 shadow-sm"
                    : "bg-white/5 border border-white/10 opacity-65"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    step === 2
                      ? "bg-white text-[#153626]"
                      : "border border-white/40 text-white"
                  }`}
                >
                  02
                </div>
                <div>
                  <p
                    className={`text-xs font-bold tracking-wider uppercase ${
                      step === 2 ? "text-emerald-200" : "text-gray-300"
                    }`}
                  >
                    STEP 02 — KEAMANAN AKUN
                  </p>
                  <p
                    className={`text-xs mt-0.5 leading-snug ${
                      step === 2 ? "text-white" : "text-gray-300"
                    }`}
                  >
                    Buat password dan PIN untuk melindungi akun serta saldo tabungan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footnote Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Khusus Warga</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Stepper Form Content (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke login</span>
              </Link>

              <span className="bg-[#EAF6EE] text-[#1E7E48] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Langkah {step} dari 2
              </span>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full bg-[#1E7E48] transition-all duration-300 ease-out ${
                  step === 1 ? "w-1/2" : "w-full"
                }`}
              />
            </div>

            {/* Form Title & Description */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Daftar sebagai Warga
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Lengkapi informasi berikut untuk membuat akun SIMPANWASTE.
            </p>

            {/* General Error Alert */}
            {generalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{generalError}</p>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E48] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{successMessage}</p>
              </div>
            )}

            {/* STEP 1: FORM DATA DIRI */}
            {step === 1 && (
              <form onSubmit={handleProceedToStep2} className="space-y-4">
                {/* Row 1: Nama Lengkap & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nama lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Contoh: Ayu Lestari"
                        className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
                          fieldErrors.nama
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                        }`}
                      />
                    </div>
                    {fieldErrors.nama && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.nama}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Username unik
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <AtSign className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        placeholder="contoh.username"
                        className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
                          fieldErrors.username
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Huruf kecil, angka, titik, atau garis bawah.
                    </p>
                    {fieldErrors.username && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Nomor Telepon */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nomor telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="08xx xxxx xxxx"
                      className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
                        fieldErrors.no_hp
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                      }`}
                    />
                  </div>
                  {fieldErrors.no_hp && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.no_hp}</p>
                  )}
                </div>

                {/* Row 3: Alamat Lengkap */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Alamat lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Masukkan alamat domisili lengkap di Palembang"
                      className={`w-full pt-2.5 pb-2.5 pl-10 pr-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white resize-none ${
                        fieldErrors.alamat
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                      }`}
                    />
                  </div>
                  {fieldErrors.alamat && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.alamat}</p>
                  )}
                </div>

                {/* Step 1 Action Button */}
                <button
                  type="submit"
                  className="w-full bg-[#1E7E48] hover:bg-[#18663A] text-white font-semibold py-3.5 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#1E7E48]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: FORM KEAMANAN AKUN & PIN */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                {/* Row 1: Password & Konfirmasi Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="Minimal 8 karakter"
                        className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
                          fieldErrors.password
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Gunakan minimal 8 karakter.
                    </p>
                    {fieldErrors.password && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Konfirmasi password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
                          fieldErrors.confirmPassword
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: PIN Keamanan (6 Angka) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    PIN keamanan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setPin(val);
                      }}
                      placeholder="• • • • • •"
                      className={`w-full h-12 pl-10 pr-4 rounded-xl border text-base font-bold tracking-[0.4em] text-gray-900 placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 transition bg-white ${
                        fieldErrors.pin
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Tepat 6 angka untuk melindungi akses saldo tabungan.
                  </p>
                  {fieldErrors.pin && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.pin}</p>
                  )}
                </div>

                {/* Dual Action Buttons Row */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-5 py-3.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#1E7E48] hover:bg-[#18663A] text-white font-semibold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#1E7E48]/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar Akun Warga</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Switch to Login Link */}
          <div className="mt-8 pt-4 text-center border-t border-gray-100 text-sm text-gray-600">
            <span>Sudah memiliki akun? </span>
            <Link
              href="/login"
              className="text-[#1E7E48] font-bold hover:underline transition"
            >
              Masuk sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

