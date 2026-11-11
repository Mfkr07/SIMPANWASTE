"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Recycle,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    address: "",
    password: "",
    confirmation: "",
    pin: "",
  });

  const existingUsernames = ["ayu.lestari", "budi.s", "rizky.p", "admin.simpan"];

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateFirstStep = () => {
    const nextErrors: Record<string, string> = {};
    const normalizedUsername = form.username.trim().toLowerCase();
    const normalizedPhone = form.phone.replace(/\D/g, "");

    if (!form.name.trim()) nextErrors.name = "Nama lengkap wajib diisi.";
    if (!normalizedUsername) nextErrors.username = "Username wajib diisi.";
    else if (!/^[a-z0-9._]{4,20}$/.test(normalizedUsername))
      nextErrors.username = "Gunakan 4–20 karakter: huruf kecil, angka, titik, atau garis bawah.";
    else if (existingUsernames.includes(normalizedUsername))
      nextErrors.username = "Username sudah digunakan. Silakan pilih username lain.";

    if (!normalizedPhone) nextErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^08\d{8,11}$/.test(normalizedPhone))
      nextErrors.phone = "Gunakan nomor Indonesia yang valid, diawali 08.";

    if (!form.address.trim()) nextErrors.address = "Alamat lengkap wajib diisi.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSecondStep = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.password) nextErrors.password = "Password wajib diisi.";
    else if (form.password.length < 8)
      nextErrors.password = "Password harus terdiri dari minimal 8 karakter.";

    if (!form.confirmation) nextErrors.confirmation = "Konfirmasi password wajib diisi.";
    else if (form.confirmation !== form.password)
      nextErrors.confirmation = "Konfirmasi password tidak sesuai.";

    if (!form.pin) nextErrors.pin = "PIN keamanan wajib diisi.";
    else if (!/^\d{6}$/.test(form.pin)) nextErrors.pin = "PIN harus terdiri dari tepat 6 angka.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const continueToSecurity = () => {
    if (validateFirstStep()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateSecondStep()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: form.name.trim(),
          username: form.username.trim().toLowerCase(),
          no_hp: form.phone.trim(),
          alamat: form.address.trim(),
          password: form.password,
          pin: form.pin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Gagal mendaftarkan akun." });
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } catch {
      // Fallback for demo mock
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    }
  };

  const inputClass = (field: string) =>
    `input bg-slate-50/70 py-3 ${
      errors[field]
        ? "border-red-400 bg-red-50/30 ring-2 ring-red-100 focus:border-red-400"
        : "hover:border-slate-300"
    }`;

  const progress = [
    {
      number: "01",
      label: "DATA DIRI",
      desc: "Lengkapi informasi pribadi untuk membuat akun.",
    },
    {
      number: "02",
      label: "KEAMANAN AKUN",
      desc: "Buat password dan PIN untuk melindungi akun serta saldo tabungan.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f1f5f2] px-4 py-5 sm:px-6 sm:py-8 lg:grid lg:place-items-center lg:px-8 lg:py-10">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-green-200/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl pointer-events-none" />

      <div className="relative mx-auto grid w-full max-w-[1150px] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_28px_90px_rgba(15,23,42,.13)] lg:min-h-[720px] lg:grid-cols-[.36fr_.64fr]">
        {/* Aside Panel */}
        <aside className="relative overflow-hidden bg-[#166534] px-6 py-7 text-white sm:px-8 sm:py-9 lg:flex lg:flex-col lg:px-10 lg:py-11">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[48px] border-white/5 pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[52px] border-green-300/10 pointer-events-none" />
          <Recycle className="absolute bottom-8 right-8 hidden text-white/5 lg:block pointer-events-none" size={112} />

          <Link href="/" className="relative flex items-center gap-3 group">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-800 shadow-sm transition group-hover:scale-105">
              <Recycle size={23} />
            </div>
            <div>
              <p className="font-extrabold tracking-tight">SIMPANWASTE</p>
              <p className="text-[10px] font-bold tracking-[.16em] text-green-200 uppercase">
                PALEMBANG PILOT
              </p>
            </div>
          </Link>

          <div className="relative mt-8 hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-green-300">
              Registrasi Warga
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.18] tracking-tight">
              Mulai perjalananmu menuju lingkungan yang lebih bersih.
            </h1>
            <p className="mt-5 text-sm leading-7 text-green-100">
              Buat akun dan bergabung bersama gerakan pemilahan sampah melalui SIMPANWASTE.
            </p>
          </div>

          <div className="relative mt-7 lg:mt-auto">
            <div className="grid grid-cols-2 gap-3 lg:block lg:space-y-0">
              {progress.map((item, index) => {
                const active = step === index + 1;
                const complete = step > index + 1;
                return (
                  <div
                    key={item.number}
                    className="relative flex gap-3 lg:gap-4 lg:pb-10 last:lg:pb-0"
                  >
                    {index === 0 && (
                      <span className="absolute left-[17px] top-9 hidden h-[calc(100%-18px)] w-px bg-white/20 lg:block" />
                    )}
                    <div
                      className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-extrabold transition ${
                        active
                          ? "border-white bg-white text-green-800 shadow-lg"
                          : complete
                            ? "border-green-300 bg-green-300 text-green-950"
                            : "border-white/30 bg-white/10 text-green-100"
                      }`}
                    >
                      {complete ? <Check size={15} strokeWidth={3} /> : item.number}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-[10px] font-extrabold tracking-[.12em] ${
                          active ? "text-white" : "text-green-200"
                        }`}
                      >
                        STEP {item.number} — {item.label}
                      </p>
                      <p className="mt-1.5 hidden text-xs leading-5 text-green-100 sm:block">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Form Panel */}
        <main className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-11">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-green-700"
            >
              <ArrowLeft size={15} /> Kembali ke login
            </Link>
            <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-green-700">
              Khusus Warga
            </span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[.15em] text-green-700">
              Langkah {step} dari 2
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Daftar sebagai Warga
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lengkapi informasi berikut untuk membuat akun SIMPANWASTE.
            </p>
          </div>

          {errors.general && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
              {errors.general}
            </div>
          )}

          {step === 1 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass("name")}
                  placeholder="Contoh: Ayu Lestari"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.name}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Username unik
                </span>
                <input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value.toLowerCase())}
                  className={inputClass("username")}
                  placeholder="contoh.username"
                  autoCapitalize="none"
                />
                {errors.username ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.username}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Huruf kecil, angka, titik, atau garis bawah.
                  </p>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor telepon
                </span>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
                    className={`${inputClass("phone")} pl-10`}
                    placeholder="08xx xxxx xxxx"
                    inputMode="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.phone}</p>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Alamat lengkap
                </span>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={`${inputClass("address")} min-h-28 resize-none`}
                  placeholder="Masukkan alamat domisili lengkap di Palembang"
                />
                {errors.address && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.address}</p>
                )}
              </label>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={continueToSecurity}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-[.98] sm:w-auto cursor-pointer"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <div className="relative">
                  <input
                    autoFocus
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass("password")} pr-11`}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.password}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">Gunakan minimal 8 karakter.</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Konfirmasi password
                </span>
                <div className="relative">
                  <input
                    value={form.confirmation}
                    onChange={(e) => update("confirmation", e.target.value)}
                    type={showConfirmation ? "text" : "password"}
                    className={`${inputClass("confirmation")} pr-11`}
                    placeholder="Ulangi password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmation((visible) => !visible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={
                      showConfirmation ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"
                    }
                  >
                    {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmation && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.confirmation}</p>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  PIN keamanan
                </span>
                <input
                  value={form.pin}
                  onChange={(e) => update("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className={`${inputClass("pin")} max-w-xs text-lg tracking-[.35em]`}
                  placeholder="••••••"
                />
                {errors.pin ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.pin}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Tepat 6 angka untuk melindungi akses saldo tabungan.
                  </p>
                )}
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                  }}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[.98] cursor-pointer"
                >
                  <ArrowLeft size={17} />
                  <span>Kembali</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      <span>Mendaftarkan akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Warga</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-auto border-t border-slate-100 pt-6 text-center text-sm text-slate-500 lg:mt-8">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-bold text-green-700 hover:underline">
              Masuk sekarang
            </Link>
          </div>
        </main>
      </div>

      {success && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="shrink-0 text-green-400" size={21} />
          <span>Pendaftaran berhasil. Mengarahkan Anda ke halaman login...</span>
        </div>
      )}
    </div>
  );
}
